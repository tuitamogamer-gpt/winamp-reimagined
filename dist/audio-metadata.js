// Read local tags without loading or modifying the audio stream. Unsupported
// containers and transformed/encrypted tags fall back to the filename in the UI.
const MAX_TAG_BYTES = 12 * 1024 * 1024;
const MAX_ART_BYTES = 8 * 1024 * 1024;
const MAX_TEXT_BYTES = 64 * 1024;
const MAX_FIELDS = 1024;
const TEXT_FIELDS = { TIT2: 'title', TPE1: 'artist', TALB: 'album', TCON: 'genre', TYER: 'year', TDRC: 'year' };
const GENRES = 'Blues|Classic Rock|Country|Dance|Disco|Funk|Grunge|Hip-Hop|Jazz|Metal|New Age|Oldies|Other|Pop|R&B|Rap|Reggae|Rock|Techno|Industrial|Alternative|Ska|Death Metal|Pranks|Soundtrack|Euro-Techno|Ambient|Trip-Hop|Vocal|Jazz+Funk|Fusion|Trance|Classical|Instrumental|Acid|House|Game|Sound Clip|Gospel|Noise|AlternRock|Bass|Soul|Punk|Space|Meditative|Instrumental Pop|Instrumental Rock|Ethnic|Gothic|Darkwave|Techno-Industrial|Electronic|Pop-Folk|Eurodance|Dream|Southern Rock|Comedy|Cult|Gangsta|Top 40|Christian Rap|Pop/Funk|Jungle|Native American|Cabaret|New Wave|Psychadelic|Rave|Showtunes|Trailer|Lo-Fi|Tribal|Acid Punk|Acid Jazz|Polka|Retro|Musical|Rock & Roll|Hard Rock|Folk|Folk-Rock|National Folk|Swing|Fast Fusion|Bebob|Latin|Revival|Celtic|Bluegrass|Avantgarde|Gothic Rock|Progressive Rock|Psychedelic Rock|Symphonic Rock|Slow Rock|Big Band|Chorus|Easy Listening|Acoustic|Humour|Speech|Chanson|Opera|Chamber Music|Sonata|Symphony|Booty Bass|Primus|Porn Groove|Satire|Slow Jam|Club|Tango|Samba|Folklore|Ballad|Power Ballad|Rhythmic Soul|Freestyle|Duet|Punk Rock|Drum Solo|A capella|Euro-House|Dance Hall|Goa|Drum & Bass|Club-House|Hardcore|Terror|Indie|BritPop|Negerpunk|Polsk Punk|Beat|Christian Gangsta Rap|Heavy Metal|Black Metal|Crossover|Contemporary Christian|Christian Rock|Merengue|Salsa|Thrash Metal|Anime|JPop|SynthPop'.split('|');

function ascii(bytes) {
  return Array.from(bytes, byte => String.fromCharCode(byte)).join('');
}

function integer(bytes, offset, littleEndian = false) {
  if (offset < 0 || offset + 4 > bytes.length) throw new Error('Truncated tag');
  return new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0, littleEndian);
}

function synchsafe(bytes, offset) {
  if (offset + 4 > bytes.length || bytes.subarray(offset, offset + 4).some(byte => byte & 0x80)) throw new Error('Invalid tag size');
  return bytes[offset] * 2097152 + bytes[offset + 1] * 16384 + bytes[offset + 2] * 128 + bytes[offset + 3];
}

function cleanText(value) {
  return value.replace(/^\uFEFF/, '').replace(/\0+$/g, '').replace(/\0+/g, ' / ')
    .replace(/[\u0001-\u001f\u007f-\u009f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1024);
}

function decodeText(bytes, encoding) {
  if (!bytes.length || bytes.length > MAX_TEXT_BYTES) return '';
  try {
    if (encoding === 0) return cleanText(ascii(bytes));
    if (encoding === 3) return cleanText(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (encoding !== 1 && encoding !== 2) return '';
    if (bytes.length % 2) return '';
    let format = 'utf-16be';
    if (encoding === 1) {
      if (bytes[0] === 0xff && bytes[1] === 0xfe) format = 'utf-16le';
      else if (bytes[0] !== 0xfe || bytes[1] !== 0xff) return '';
      bytes = bytes.subarray(2);
    }
    return cleanText(new TextDecoder(format, { fatal: true }).decode(bytes));
  } catch { return ''; }
}

function setText(result, field, value) {
  if (!value) return;
  if (field === 'genre') {
    const genre = value.match(/^\(?(\d{1,3})\)?$/);
    if (genre) value = GENRES[Number(genre[1])] || value;
  }
  if (field === 'year') value = value.match(/^\d{4}/)?.[0] || '';
  if (value) result[field] = value;
}

// Only passive raster image formats are exposed to the UI. MIME strings from
// untrusted files are ignored in favor of the embedded image signature.
function artworkBlob(bytes) {
  if (bytes.length < 12 || bytes.length > MAX_ART_BYTES) return null;
  let type;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) type = 'image/jpeg';
  else if (ascii(bytes.subarray(0, 8)) === '\x89PNG\r\n\x1a\n') type = 'image/png';
  else if (ascii(bytes.subarray(0, 4)) === 'RIFF' && ascii(bytes.subarray(8, 12)) === 'WEBP') type = 'image/webp';
  else if (/^GIF8[79]a$/.test(ascii(bytes.subarray(0, 6)))) type = 'image/gif';
  return type ? new Blob([bytes], { type }) : null;
}

function selectArtwork(result, bytes, pictureType, state) {
  if (result.artwork && (state.front || pictureType !== 3)) return;
  const artwork = artworkBlob(bytes);
  if (artwork) { result.artwork = artwork; state.front = pictureType === 3; }
}

function readAttachedPicture(data, result, state) {
  if (data.length < 5 || data.length > MAX_ART_BYTES + MAX_TEXT_BYTES) return;
  const encoding = data[0];
  if (encoding > 3) return;
  const mimeEnd = data.indexOf(0, 1);
  if (mimeEnd < 1 || mimeEnd > 255 || mimeEnd + 2 >= data.length) return;
  const pictureType = data[mimeEnd + 1];
  let offset = mimeEnd + 2;
  const step = encoding === 1 || encoding === 2 ? 2 : 1;
  const descriptionEnd = Math.min(data.length - step, offset + MAX_TEXT_BYTES);
  for (; offset <= descriptionEnd; offset += step) {
    if (data[offset] === 0 && (step === 1 || data[offset + 1] === 0)) {
      selectArtwork(result, data.subarray(offset + step), pictureType, state);
      return;
    }
  }
}

async function readId3(file, header) {
  const version = header[3], flags = header[5];
  if ((version !== 3 && version !== 4) || header[4] === 0xff) return {};
  if ((flags & 0x80) || (flags & (version === 3 ? 0x1f : 0x0f))) return {};
  const size = synchsafe(header, 6);
  if (size > MAX_TAG_BYTES || size > file.size - 10) return {};
  const bytes = new Uint8Array(await file.slice(10, 10 + size).arrayBuffer());
  const result = {}, state = { front: false };
  let offset = 0, frames = 0;
  if (flags & 0x40) {
    const extendedSize = version === 3 ? integer(bytes, 0) + 4 : synchsafe(bytes, 0);
    if (extendedSize < (version === 3 ? 10 : 6) || extendedSize > bytes.length) return {};
    offset = extendedSize;
  }
  while (offset + 10 <= bytes.length && frames++ < MAX_FIELDS) {
    if (bytes[offset] === 0) break;
    const id = ascii(bytes.subarray(offset, offset + 4));
    if (!/^[A-Z0-9]{4}$/.test(id)) return {};
    const length = version === 3 ? integer(bytes, offset + 4) : synchsafe(bytes, offset + 4);
    const status = bytes[offset + 8], format = bytes[offset + 9];
    offset += 10;
    if (length > bytes.length - offset) return {};
    // Grouping, compression, encryption, frame unsynchronization, and data
    // length indicators need transformations that this small reader omits.
    const unsupported = version === 3 ? (status & 0x1f) || format : (status & 0x8f) || format;
    if (length && !unsupported) {
      const data = bytes.subarray(offset, offset + length);
      if (TEXT_FIELDS[id] && length <= MAX_TEXT_BYTES) setText(result, TEXT_FIELDS[id], decodeText(data.subarray(1), data[0]));
      else if (id === 'APIC') readAttachedPicture(data, result, state);
    }
    offset += length;
  }
  return result;
}

async function readId3v1(file) {
  if (file.size < 128) return {};
  const bytes = new Uint8Array(await file.slice(file.size - 128, file.size).arrayBuffer());
  if (ascii(bytes.subarray(0, 3)) !== 'TAG') return {};
  const result = {};
  for (const [field, start, end] of [['title', 3, 33], ['artist', 33, 63], ['album', 63, 93], ['year', 93, 97]]) {
    const value = bytes.subarray(start, end);
    const terminator = value.indexOf(0);
    setText(result, field, decodeText(terminator < 0 ? value : value.subarray(0, terminator), 0));
  }
  if (GENRES[bytes[127]]) result.genre = GENRES[bytes[127]];
  return result;
}

function readVorbisComments(bytes, result) {
  let offset = 4 + integer(bytes, 0, true);
  const count = integer(bytes, offset, true);
  offset += 4;
  if (count > MAX_FIELDS) return;
  const fields = { TITLE: 'title', ARTIST: 'artist', ALBUM: 'album', GENRE: 'genre', DATE: 'year', YEAR: 'year' };
  for (let index = 0; index < count; index++) {
    const length = integer(bytes, offset, true);
    offset += 4;
    if (length > bytes.length - offset) throw new Error('Truncated comment');
    if (length <= MAX_TEXT_BYTES) {
      const comment = decodeText(bytes.subarray(offset, offset + length), 3);
      const separator = comment.indexOf('=');
      const field = fields[comment.slice(0, separator).toUpperCase()];
      if (separator > 0 && field && !result[field]) setText(result, field, comment.slice(separator + 1));
    }
    offset += length;
  }
}

function readFlacPicture(bytes, result, state) {
  const pictureType = integer(bytes, 0);
  let offset = 8 + integer(bytes, 4);
  offset += 4 + integer(bytes, offset);
  // Width, height, color depth, and indexed color count precede the image.
  offset += 16;
  const size = integer(bytes, offset);
  offset += 4;
  if (size > bytes.length - offset) throw new Error('Truncated picture');
  selectArtwork(result, bytes.subarray(offset, offset + size), pictureType, state);
}

async function readFlac(file) {
  const result = {}, state = { front: false };
  let offset = 4;
  for (let index = 0; index < 64; index++) {
    if (offset + 4 > file.size || offset + 4 > MAX_TAG_BYTES) return {};
    const header = new Uint8Array(await file.slice(offset, offset + 4).arrayBuffer());
    const size = header[1] * 65536 + header[2] * 256 + header[3];
    const type = header[0] & 0x7f;
    offset += 4;
    if (type === 127 || size > file.size - offset || size > MAX_TAG_BYTES - offset) return {};
    if (type === 4 || type === 6) {
      const bytes = new Uint8Array(await file.slice(offset, offset + size).arrayBuffer());
      if (type === 4) readVorbisComments(bytes, result);
      else readFlacPicture(bytes, result, state);
    }
    offset += size;
    if (header[0] & 0x80) return result;
  }
  return {};
}

/**
 * Read ID3v2.3/v2.4, ID3v1, or native FLAC tags from a File/Blob.
 * Resolves to { title?, artist?, album?, genre?, year?, artwork?: Blob }.
 * Never throws for unsupported/corrupt files. Reads at most 12 MiB of tags;
 * artwork is limited to 8 MiB. The caller owns any URL.createObjectURL result.
 */
export async function readAudioMetadata(file) {
  try {
    if (!file || !Number.isSafeInteger(file.size) || file.size < 10 || typeof file.slice !== 'function') return {};
    const header = new Uint8Array(await file.slice(0, 10).arrayBuffer());
    if (ascii(header.subarray(0, 3)) === 'ID3') return await readId3(file, header);
    if (ascii(header.subarray(0, 4)) === 'fLaC') return await readFlac(file);
    return await readId3v1(file);
  } catch { return {}; }
}
