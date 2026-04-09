const DB_NAME = 'portable-workspace';
const DB_VERSION = 3;
const FILES_STORE = 'files';
const HISTORY_STORE = 'file-history';
const ENCLAVES_STORE = 'enclaves';

export interface EnclaveRecord {
  id: string;
  name: string;
  avatar: string;
  purpose: string;
  theme: string;
  createdAt: number;
  order?: number;
}

let activeEnclaveId = 'default';
export function setActiveEnclave(id: string) {
  activeEnclaveId = id;
}

export interface FileRecord {
  path: string;
  content: string;
  type: string;
  createdAt: number;
  updatedAt?: number;
}

export interface VersionRecord {
  path: string;
  content: string;
  timestamp: number;
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
        if (!db.objectStoreNames.contains(HISTORY_STORE)) {
          const historyStore = db.createObjectStore(HISTORY_STORE, { keyPath: ['path', 'timestamp'] });
          historyStore.createIndex('by-path', 'path', { unique: false });
        }
        if (!db.objectStoreNames.contains(ENCLAVES_STORE)) {
          db.createObjectStore(ENCLAVES_STORE, { keyPath: 'id' });
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
    request.onsuccess = () => {
      const all = (request.result as FileRecord[]) || [];
      const prefix = activeEnclaveId + ':';
      resolve(all.filter(f => f.path.startsWith(prefix)).map(f => ({ ...f, path: f.path.substring(prefix.length) })));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getFile(path: string): Promise<FileRecord | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readonly');
    const request = tx.objectStore(FILES_STORE).get(activeEnclaveId + ':' + path);
    request.onsuccess = () => {
      const res = request.result as FileRecord;
      resolve(res ? { ...res, path: res.path.substring((activeEnclaveId + ':').length) } : null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveFile(fileData: Omit<FileRecord, 'updatedAt'> & { updatedAt?: number }): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readwrite');
    tx.objectStore(FILES_STORE).put({
      ...fileData,
      path: activeEnclaveId + ':' + fileData.path,
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
    tx.objectStore(FILES_STORE).delete(activeEnclaveId + ':' + path);
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
    toDelete.forEach(f => store.delete(activeEnclaveId + ':' + f.path));
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
        ...f,
        path: activeEnclaveId + ':' + f.path,
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
    store.delete(activeEnclaveId + ':' + oldPath);
    store.put({ ...file, path: activeEnclaveId + ':' + newPath, updatedAt: Date.now() });
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
      store.delete(activeEnclaveId + ':' + f.path);
      const newPath = f.path === oldPrefix
        ? newPrefix
        : newPrefix + f.path.substring(oldPrefix.length);
      store.put({ ...f, path: activeEnclaveId + ':' + newPath, updatedAt: Date.now() });
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ===== VERSION HISTORY =====

const MAX_VERSIONS_PER_FILE = 20;

export async function saveVersion(path: string, content: string): Promise<void> {
  const db = await getDB();
  const internalPath = activeEnclaveId + ':' + path;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HISTORY_STORE, 'readwrite');
    const store = tx.objectStore(HISTORY_STORE);
    store.put({ path: internalPath, content, timestamp: Date.now() });

    // Prune old versions beyond the limit
    const idx = store.index('by-path');
    const req = idx.getAllKeys(IDBKeyRange.only(internalPath));
    req.onsuccess = () => {
      const keys = req.result as [string, number][];
      if (keys.length > MAX_VERSIONS_PER_FILE) {
        // Keys come sorted by [path, timestamp] — delete oldest
        const toDelete = keys.slice(0, keys.length - MAX_VERSIONS_PER_FILE);
        toDelete.forEach(key => store.delete(key));
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getVersions(path: string): Promise<VersionRecord[]> {
  const db = await getDB();
  const internalPath = activeEnclaveId + ':' + path;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HISTORY_STORE, 'readonly');
    const idx = tx.objectStore(HISTORY_STORE).index('by-path');
    const request = idx.getAll(IDBKeyRange.only(internalPath));
    request.onsuccess = () => {
      let versions = (request.result as VersionRecord[]) || [];
      versions = versions.map(v => ({...v, path: v.path.substring((activeEnclaveId + ':').length)}));
      // Sort newest first
      versions.sort((a, b) => b.timestamp - a.timestamp);
      resolve(versions);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function restoreVersion(path: string, timestamp: number): Promise<string | null> {
  const db = await getDB();
  const internalPath = activeEnclaveId + ':' + path;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HISTORY_STORE, 'readonly');
    const request = tx.objectStore(HISTORY_STORE).get([internalPath, timestamp]);
    request.onsuccess = () => {
      const version = request.result as VersionRecord | undefined;
      resolve(version?.content ?? null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function migrateLegacyData(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([FILES_STORE, HISTORY_STORE, ENCLAVES_STORE], 'readwrite');
    const filesReq = tx.objectStore(FILES_STORE).getAll();
    filesReq.onsuccess = () => {
      const files = filesReq.result as FileRecord[];
      const legacyFiles = files.filter(f => !f.path.includes(':') && f.path !== '');
      if (legacyFiles.length > 0) {
        const enclaveId = 'default-legacy';
        const enclaveStore = tx.objectStore(ENCLAVES_STORE);
        enclaveStore.put({
          id: enclaveId,
          name: 'Restored Workspace',
          avatar: 'Folder',
          purpose: 'Restored from previous version',
          theme: 'dark',
          createdAt: Date.now()
        });

        const fileStore = tx.objectStore(FILES_STORE);
        for (const file of legacyFiles) {
          fileStore.delete(file.path);
          fileStore.put({ ...file, path: enclaveId + ':' + file.path });
        }

        const historyReq = tx.objectStore(HISTORY_STORE).getAll();
        historyReq.onsuccess = () => {
          const history = historyReq.result as VersionRecord[];
          const legacyHistory = history.filter(h => !h.path.includes(':'));
          if (legacyHistory.length > 0) {
            const historyS = tx.objectStore(HISTORY_STORE);
            for (const h of legacyHistory) {
              historyS.delete([h.path, h.timestamp]);
              historyS.put({ ...h, path: enclaveId + ':' + h.path });
            }
          }
        };
      }
      resolve();
    };
    filesReq.onerror = () => reject(filesReq.error);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getEnclaves(): Promise<EnclaveRecord[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ENCLAVES_STORE, 'readonly');
    const request = tx.objectStore(ENCLAVES_STORE).getAll();
    request.onsuccess = () => {
      const res = (request.result as EnclaveRecord[]) || [];
      res.sort((a,b) => (a.order ?? a.createdAt) - (b.order ?? b.createdAt));
      resolve(res);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getEnclave(id: string): Promise<EnclaveRecord | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ENCLAVES_STORE, 'readonly');
    const request = tx.objectStore(ENCLAVES_STORE).get(id);
    request.onsuccess = () => resolve((request.result as EnclaveRecord) || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveEnclave(enclave: EnclaveRecord): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ENCLAVES_STORE, 'readwrite');
    tx.objectStore(ENCLAVES_STORE).put(enclave);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteEnclave(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ENCLAVES_STORE, 'readwrite');
    tx.objectStore(ENCLAVES_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
