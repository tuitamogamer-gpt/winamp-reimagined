/** Browser-local audio storage. Audio never leaves this device. */
const DATABASE = 'winamp-library';
const STORE = 'tracks';
let connection;

export function fileSignature(file) {
  return JSON.stringify([file.name, file.size, file.lastModified || 0, file.type || '']);
}

function openDatabase() {
  if (connection) return connection;
  connection = new Promise((resolve, reject) => {
    let settled = false;
    let request;
    const fail = error => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error || new Error('Browser storage is unavailable.'));
    };
    const timer = setTimeout(() => fail(new Error('Browser storage took too long to open.')), 4000);
    try {
      if (!globalThis.indexedDB) throw new Error('Browser storage is unavailable.');
      request = indexedDB.open(DATABASE, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('signature', 'signature', { unique: true });
        }
      };
      request.onerror = () => fail(request.error);
      request.onblocked = () => fail(new Error('Browser storage is busy in another tab.'));
      request.onsuccess = () => {
        const db = request.result;
        if (settled) { db.close(); return; }
        settled = true;
        clearTimeout(timer);
        db.onversionchange = () => { db.close(); connection = null; };
        db.onclose = () => { connection = null; };
        resolve(db);
      };
    } catch (error) { fail(error); }
  }).catch(error => { connection = null; throw error; });
  return connection;
}

async function transact(mode, operation) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    let transaction;
    let request;
    try {
      transaction = db.transaction(STORE, mode);
      request = operation(transaction.objectStore(STORE));
    } catch (error) { reject(error); return; }
    const timer = setTimeout(() => {
      try { transaction.abort(); } catch { /* Already complete. */ }
    }, 10000);
    transaction.oncomplete = () => { clearTimeout(timer); resolve(request.result); };
    transaction.onabort = transaction.onerror = () => {
      clearTimeout(timer);
      reject(transaction.error || request.error || new Error('Browser storage could not be updated.'));
    };
  });
}

export const libraryStore = {
  list: () => transact('readonly', store => store.getAll()),
  save: (track, file) => {
    const { src, persisted, ...metadata } = track;
    return transact('readwrite', store => store.put({ ...metadata, file }));
  },
  remove: id => transact('readwrite', store => store.delete(id))
};
