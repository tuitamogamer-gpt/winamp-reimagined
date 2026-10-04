const STORAGE_KEY = 'winamp-skin';
const SKINS = [
  { id: 'lime', name: 'Original Lime', mood: 'Poznati sjaj. Novi ritam.', accent: '#cbf58b', muted: '#718d50', base: '#34442b' },
  { id: 'amber', name: 'Amber', mood: 'Toplina kasnih sati.', accent: '#ffc187', muted: '#b18761', base: '#4b3930' },
  { id: 'arctic', name: 'Arctic', mood: 'Čisto. Mirno. Beskrajno.', accent: '#96e5f2', muted: '#659aa7', base: '#2c4850' },
];
let currentSkin = SKINS[0];
let initialized = false;

export function getSkinColors() {
  const { accent, muted, base } = currentSkin;
  return { accent, muted, base };
}

export function initSkins() {
  if (initialized) return;
  const trigger = document.getElementById('skin-toggle');
  if (!trigger) return;
  initialized = true;
  trigger.classList.add('skin-toggle');
  trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'skin-dialog');
  trigger.innerHTML = '<span class="skin-toggle-swatches" aria-hidden="true"><i></i><i></i><i></i></span><span class="skin-toggle-label">Skins</span>';

  const dialog = document.createElement('dialog');
  dialog.id = 'skin-dialog';
  dialog.setAttribute('aria-labelledby', 'skin-dialog-title');
  dialog.setAttribute('aria-describedby', 'skin-dialog-description');
  dialog.innerHTML = `
    <div class="skin-dialog-heading">
      <div><p class="skin-eyebrow">WINAMP SKINS</p><h2 id="skin-dialog-title">Tvoj player. Tvoje boje.</h2></div>
      <button type="button" class="skin-close" aria-label="Zatvori odabir boja"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    </div>
    <p id="skin-dialog-description">Pronađi boje koje prate tvoj zvuk.</p>
    <fieldset class="skin-options"><legend class="skin-visually-hidden">Odaberi izgled playera</legend>
      ${SKINS.map(skin => `<label class="skin-option" data-preview-skin="${skin.id}">
        <input type="radio" name="winamp-skin" value="${skin.id}" aria-describedby="skin-mood-${skin.id}">
        <span class="skin-preview" aria-hidden="true">
          <span class="skin-preview-top"><i></i><b></b><b></b></span>
          <span class="skin-preview-player"><span class="skin-preview-cover"><i></i></span><span class="skin-preview-info"><b></b><b></b><i></i></span><span class="skin-preview-eq"><i></i><i></i><i></i><i></i><i></i></span></span>
          <span class="skin-preview-tracks"><i></i><i></i><i></i></span>
          <span class="skin-preview-bottom"><i></i><b></b><i></i></span>
        </span>
        <span class="skin-option-copy"><span class="skin-option-name">${skin.name}</span><span class="skin-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-8"/></svg></span><span class="skin-option-mood" id="skin-mood-${skin.id}">${skin.mood}</span></span>
      </label>`).join('')}
    </fieldset>
    <div class="skin-dialog-footer"><span class="skin-footer-dot" aria-hidden="true"></span><span id="skin-save-status" role="status" aria-live="polite">Izbor se automatski sprema na ovom uređaju.</span><span class="skin-escape" aria-hidden="true">ESC</span></div>`;
  document.body.append(dialog);
  const inputs = [...dialog.querySelectorAll('input[name="winamp-skin"]')];
  const status = dialog.querySelector('#skin-save-status');
  let returnFocus = trigger;

  function applySkin(id, persist = false) {
    currentSkin = SKINS.find(skin => skin.id === id) || SKINS[0];
    document.documentElement.dataset.skin = currentSkin.id;
    inputs.forEach(input => { input.checked = input.value === currentSkin.id; });
    trigger.title = `Promijeni boje · ${currentSkin.name}`;
    trigger.setAttribute('aria-label', `Promijeni boje, trenutačno ${currentSkin.name}`);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, currentSkin.id);
        status.textContent = `${currentSkin.name} · spremljeno na ovom uređaju.`;
      } catch {
        status.textContent = `${currentSkin.name} · aktivno za ovaj posjet.`;
      }
    }
    window.dispatchEvent(new CustomEvent('winamp:skinchange', { detail: { skin: currentSkin.id } }));
  }

  let saved = 'lime';
  try { saved = localStorage.getItem(STORAGE_KEY) || 'lime'; } catch { /* Private storage may be unavailable. */ }
  applySkin(saved);
  trigger.addEventListener('click', () => {
    if (dialog.open) return;
    returnFocus = document.activeElement;
    dialog.showModal();
    dialog.querySelector('input:checked')?.focus({ preventScroll: true });
  });
  inputs.forEach(input => input.addEventListener('change', () => applySkin(input.value, true)));
  dialog.querySelector('.skin-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    // Native radio navigation and Escape belong to this dialog, not the player.
    event.stopPropagation();
  });
  dialog.addEventListener('close', () => {
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  });
  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY) applySkin(event.newValue || 'lime');
  });
}
