// --- OFFLINE SYNC ENGINE ---
// Uses IndexedDB for local persistence and handles sync with backend

const DB_NAME = 'kyam_offline';
const DB_VERSION = 1;

export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('pending_sync')) {
        db.createObjectStore('pending_sync', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('cached_data')) {
        db.createObjectStore('cached_data', { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addToSyncQueue(type: string, data: any) {
  const db: any = await initDB();
  const tx = db.transaction('pending_sync', 'readwrite');
  const store = tx.objectStore('pending_sync');
  store.add({ type, data, timestamp: Date.now() });
}

export async function syncOfflineData() {
  if (!navigator.onLine) return;
  
  const db: any = await initDB();
  const tx = db.transaction('pending_sync', 'readwrite');
  const store = tx.objectStore('pending_sync');
  const request = store.getAll();

  request.onsuccess = async () => {
    const items = request.result;
    for (const item of items) {
      try {
        // Mock sync logic
        console.log(`[OFFLINE] Syncing ${item.type}...`);
        // await fetch(`/api/${item.type}`, { method: 'POST', body: JSON.stringify(item.data) });
        store.delete(item.id);
      } catch (e) {
        console.error("Sync failed for item", item.id);
      }
    }
  };
}

// Auto-sync when online
window.addEventListener('online', syncOfflineData);
