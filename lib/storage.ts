const DB_NAME = 'portable-workspace';
const DB_VERSION = 1;
const FILES_STORE = 'files';

export interface FileRecord {
  path: string;
  content: string;
  type: string;
  createdAt: number;
  updatedAt?: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB not available on server'));
  }

  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };

      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(FILES_STORE)) {
          db.createObjectStore(FILES_STORE, { keyPath: 'path' });
        }
      };
    });
  }

  return dbPromise;
}

export async function getAllFiles(): Promise<FileRecord[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readonly');
    const request = tx.objectStore(FILES_STORE).getAll();
    request.onsuccess = () => resolve((request.result as FileRecord[]) || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getFile(path: string): Promise<FileRecord | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readonly');
    const request = tx.objectStore(FILES_STORE).get(path);
    request.onsuccess = () => resolve((request.result as FileRecord) || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveFile(fileData: Omit<FileRecord, 'updatedAt'> & { updatedAt?: number }): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readwrite');
    tx.objectStore(FILES_STORE).put({
      ...fileData,
      updatedAt: Date.now(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteFile(path: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readwrite');
    tx.objectStore(FILES_STORE).delete(path);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteByPrefix(prefix: string): Promise<number> {
  const allFiles = await getAllFiles();
  const db = await getDB();
  const toDelete = allFiles.filter(f => f.path === prefix || f.path.startsWith(prefix + '/'));

  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readwrite');
    const store = tx.objectStore(FILES_STORE);
    toDelete.forEach(f => store.delete(f.path));
    tx.oncomplete = () => resolve(toDelete.length);
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAll(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readwrite');
    tx.objectStore(FILES_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function bulkSave(files: Omit<FileRecord, 'updatedAt'>[]): Promise<void> {
  const db = await getDB();
  const now = Date.now();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readwrite');
    const store = tx.objectStore(FILES_STORE);
    files.forEach(f => {
      store.put({
        path: f.path,
        content: f.content,
        type: f.type || 'text',
        createdAt: f.createdAt || now,
        updatedAt: now,
      });
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function renameFile(oldPath: string, newPath: string): Promise<void> {
  const file = await getFile(oldPath);
  if (!file) throw new Error('File not found');

  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readwrite');
    const store = tx.objectStore(FILES_STORE);
    store.delete(oldPath);
    store.put({ ...file, path: newPath, updatedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function renameFolder(oldPrefix: string, newPrefix: string): Promise<void> {
  const allFiles = await getAllFiles();
  const affected = allFiles.filter(f => f.path === oldPrefix || f.path.startsWith(oldPrefix + '/'));

  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readwrite');
    const store = tx.objectStore(FILES_STORE);
    affected.forEach(f => {
      store.delete(f.path);
      const newPath = f.path === oldPrefix
        ? newPrefix
        : newPrefix + f.path.substring(oldPrefix.length);
      store.put({ ...f, path: newPath, updatedAt: Date.now() });
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
