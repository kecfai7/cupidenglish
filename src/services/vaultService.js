const VAULT_STORAGE_KEY = 'cupid_study_vault';
const MASTERED_COUNT_KEY = 'cupid_vault_mastered_count';
const VAULT_UPDATED_EVENT = 'cupid-vault-updated';

const DB_NAME = 'CupidEnglishDB';
const DB_VERSION = 2;
const STORE_NAME = 'handles';
const VAULT_ITEMS_STORE = 'vault_items';
const VAULT_META_STORE = 'vault_meta';
const HANDLE_KEY = 'vault_directory_handle';

let activeDirectoryHandle = null;
let pendingDirectoryHandle = null;
let memoryVaultSnapshot = null;

function getCachedVaultItems() {
  if (memoryVaultSnapshot?.items) {
    return memoryVaultSnapshot.items;
  }
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getCachedMasteredCount() {
  if (typeof memoryVaultSnapshot?.masteredCount === 'number') {
    return memoryVaultSnapshot.masteredCount;
  }
  try {
    const raw = localStorage.getItem(MASTERED_COUNT_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

function cacheVaultSnapshot(snapshot) {
  memoryVaultSnapshot = {
    items: snapshot.items || [],
    masteredCount: snapshot.masteredCount || 0,
    storagePath: snapshot.storagePath || ''
  };

  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(snapshot.items || []));
    localStorage.setItem(MASTERED_COUNT_KEY, String(snapshot.masteredCount || 0));
  } catch {
    // Ignore localStorage QuotaExceededError - IndexedDB handles unlimited items.
  }

  saveIndexedDbVaultSnapshot(snapshot);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(VAULT_UPDATED_EVENT, {
      detail: {
        items: snapshot.items || [],
        masteredCount: snapshot.masteredCount || 0,
        storagePath: snapshot.storagePath || (activeDirectoryHandle ? `PC 폴더: [${activeDirectoryHandle.name}]` : ''),
        directoryName: activeDirectoryHandle?.name || ''
      }
    }));
  }
}

// --- IndexedDB Directory & Items Storage ---
function openDirectoryDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(VAULT_ITEMS_STORE)) {
        db.createObjectStore(VAULT_ITEMS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(VAULT_META_STORE)) {
        db.createObjectStore(VAULT_META_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getIndexedDbVaultSnapshot() {
  try {
    const db = await openDirectoryDb();
    const items = await new Promise((resolve) => {
      const tx = db.transaction(VAULT_ITEMS_STORE, 'readonly');
      const store = tx.objectStore(VAULT_ITEMS_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    const masteredCount = await new Promise((resolve) => {
      const tx = db.transaction(VAULT_META_STORE, 'readonly');
      const store = tx.objectStore(VAULT_META_STORE);
      const req = store.get('masteredCount');
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    });

    items.sort((left, right) => (right.savedAt || '').localeCompare(left.savedAt || ''));

    return {
      items,
      masteredCount: typeof masteredCount === 'number' ? masteredCount : 0,
      storagePath: ''
    };
  } catch {
    return null;
  }
}

async function saveIndexedDbVaultSnapshot(snapshot) {
  try {
    const db = await openDirectoryDb();
    const tx = db.transaction([VAULT_ITEMS_STORE, VAULT_META_STORE], 'readwrite');
    const itemsStore = tx.objectStore(VAULT_ITEMS_STORE);
    const metaStore = tx.objectStore(VAULT_META_STORE);

    itemsStore.clear();
    for (const item of (snapshot.items || [])) {
      if (item && item.id) {
        itemsStore.put(item);
      }
    }
    metaStore.put(snapshot.masteredCount || 0, 'masteredCount');
  } catch (err) {
    console.warn('Failed writing to IndexedDB:', err);
  }
}

async function getStoredDirectoryHandle() {
  try {
    const db = await openDirectoryDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(HANDLE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function storeDirectoryHandle(handle) {
  try {
    const db = await openDirectoryDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(handle, HANDLE_KEY);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return false;
  }
}

async function removeStoredDirectoryHandle() {
  try {
    const db = await openDirectoryDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(HANDLE_KEY);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

// --- Helper Utilities for Web File System Access API ---
function sanitizeFileName(name) {
  const withoutControlChars = Array.from(String(name || 'vault-item'))
    .map((character) => (character.charCodeAt(0) < 32 ? '_' : character))
    .join('');

  const sanitized = withoutControlChars
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 120);

  return sanitized || 'vault-item';
}

function getVaultItemId(result) {
  return result?.id || result?.english || result?.arrowKorean || `vault-${Date.now()}`;
}

async function verifyDirectoryPermission(handle, readWrite = true) {
  if (!handle) return false;
  const options = { mode: readWrite ? 'readwrite' : 'read' };
  try {
    if ((await handle.queryPermission(options)) === 'granted') {
      return true;
    }
    if ((await handle.requestPermission(options)) === 'granted') {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

async function readDirectoryVaultSnapshot(dirHandle) {
  const items = [];
  let masteredCount = 0;

  try {
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        if (entry.name === '_vault_meta.json') {
          try {
            const file = await entry.getFile();
            const text = await file.text();
            const meta = JSON.parse(text);
            masteredCount = meta.masteredCount || 0;
          } catch {}
        } else if (entry.name.endsWith('.json')) {
          try {
            const file = await entry.getFile();
            const text = await file.text();
            const item = JSON.parse(text);
            if (item) items.push(item);
          } catch {}
        }
      }
    }
  } catch (err) {
    console.error('Failed reading directory handle:', err);
  }

  items.sort((left, right) => (right.savedAt || '').localeCompare(left.savedAt || ''));

  return {
    items,
    masteredCount,
    storagePath: `PC 폴더: [${dirHandle.name}]`
  };
}

async function writeDirectoryVaultItem(dirHandle, item) {
  const fileName = `${sanitizeFileName(item.id)}.json`;
  const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(item, null, 2));
  await writable.close();
}

async function deleteDirectoryVaultItem(dirHandle, itemId) {
  const fileName = `${sanitizeFileName(itemId)}.json`;
  try {
    await dirHandle.removeEntry(fileName);
  } catch {
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.json') && entry.name !== '_vault_meta.json') {
        try {
          const file = await entry.getFile();
          const text = await file.text();
          const item = JSON.parse(text);
          if (item && (item.id === itemId || item.english === itemId || item.arrowKorean === itemId)) {
            await dirHandle.removeEntry(entry.name);
            break;
          }
        } catch {}
      }
    }
  }
}

async function writeDirectoryVaultMeta(dirHandle, meta) {
  const fileHandle = await dirHandle.getFileHandle('_vault_meta.json', { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(meta, null, 2));
  await writable.close();
}

// --- Public Directory Selection API ---
export async function reconnectStoredDirectory() {
  const handle = pendingDirectoryHandle || (await getStoredDirectoryHandle());
  if (!handle) return null;

  try {
    const hasPermission = await verifyDirectoryPermission(handle, true);
    if (hasPermission) {
      activeDirectoryHandle = handle;
      pendingDirectoryHandle = null;
      const snapshot = await readDirectoryVaultSnapshot(handle);
      cacheVaultSnapshot(snapshot);
      return snapshot;
    }
  } catch (err) {
    console.warn('Failed reconnecting stored directory:', err);
  }
  return null;
}

export async function selectLocalDirectory(options = {}) {
  if (typeof window === 'undefined' || !('showDirectoryPicker' in window)) {
    throw new Error('이 브라우저는 PC 폴더 직접 연동(File System Access API)을 지원하지 않습니다. Google Chrome 또는 Microsoft Edge 브라우저를 이용해 주세요.');
  }

  const forceNewPicker = typeof options === 'boolean' ? options : !!options?.forceNewPicker;

  // 1. If stored handle exists and user did not explicitly request a new picker, attempt seamless reconnect!
  if (!forceNewPicker) {
    const reconnected = await reconnectStoredDirectory();
    if (reconnected) {
      return reconnected;
    }
  }

  // 2. Otherwise open directory picker dialog
  const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
  await storeDirectoryHandle(dirHandle);
  activeDirectoryHandle = dirHandle;
  pendingDirectoryHandle = null;

  const snapshot = await readDirectoryVaultSnapshot(dirHandle);
  cacheVaultSnapshot(snapshot);
  return snapshot;
}

export async function disconnectLocalDirectory() {
  await removeStoredDirectoryHandle();
  activeDirectoryHandle = null;
  pendingDirectoryHandle = null;
  const snapshot = {
    items: getCachedVaultItems(),
    masteredCount: getCachedMasteredCount(),
    storagePath: ''
  };
  cacheVaultSnapshot(snapshot);
  return snapshot;
}

export function getDirectoryStatus() {
  const handle = activeDirectoryHandle || pendingDirectoryHandle;
  const folderName = handle?.name || '';
  const lowerName = folderName.toLowerCase();
  const isGoogleDrive = lowerName.includes('google') || lowerName.includes('drive') || lowerName.includes('gdrive');
  const isCloudSync = isGoogleDrive || lowerName.includes('onedrive') || lowerName.includes('dropbox') || lowerName.includes('cloud');

  return {
    isConnected: !!activeDirectoryHandle,
    hasStoredDirectory: !!(activeDirectoryHandle || pendingDirectoryHandle),
    needsPermissionGrant: !activeDirectoryHandle && !!pendingDirectoryHandle,
    folderName,
    isSupported: typeof window !== 'undefined' && 'showDirectoryPicker' in window,
    isCloudSync,
    isGoogleDrive,
    cloudType: isGoogleDrive ? 'Google Drive' : (isCloudSync ? 'Cloud Sync' : null)
  };
}

// --- Backup & Restore (JSON Export / Import) ---
export function exportVaultBackup() {
  const items = getCachedVaultItems();
  const masteredCount = getCachedMasteredCount();

  const backupData = {
    version: 1,
    appName: 'Cupid English AI',
    exportedAt: new Date().toISOString(),
    masteredCount,
    itemsCount: items.length,
    items
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `cupid_study_vault_backup_${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    success: true,
    fileName,
    itemsCount: items.length
  };
}

export async function importVaultBackup(jsonContent, mode = 'merge') {
  try {
    let parsed = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;

    let newItems = [];
    let newMasteredCount = 0;

    if (Array.isArray(parsed)) {
      newItems = parsed;
    } else if (parsed && typeof parsed === 'object') {
      newItems = Array.isArray(parsed.items) ? parsed.items : [];
      newMasteredCount = typeof parsed.masteredCount === 'number' ? parsed.masteredCount : 0;
    } else {
      throw new Error('유효하지 않은 백업 파일 형식입니다.');
    }

    newItems = newItems.filter((item) => item && (item.id || item.english || item.arrowKorean));

    const existingItems = getCachedVaultItems();
    const existingMasteredCount = getCachedMasteredCount();

    let finalItems = [];
    let finalMasteredCount = 0;

    if (mode === 'merge') {
      const itemMap = new Map();
      for (const item of existingItems) {
        const id = item.id || item.english || item.arrowKorean;
        itemMap.set(id, item);
      }
      for (const item of newItems) {
        const id = item.id || item.english || item.arrowKorean;
        if (!itemMap.has(id)) {
          itemMap.set(id, {
            ...item,
            id,
            savedAt: item.savedAt || new Date().toISOString()
          });
        }
      }
      finalItems = Array.from(itemMap.values());
      finalMasteredCount = Math.max(existingMasteredCount, newMasteredCount);
    } else {
      finalItems = newItems.map((item) => ({
        ...item,
        id: item.id || item.english || item.arrowKorean || `vault-${Date.now()}`,
        savedAt: item.savedAt || new Date().toISOString()
      }));
      finalMasteredCount = newMasteredCount;
    }

    finalItems.sort((left, right) => (right.savedAt || '').localeCompare(left.savedAt || ''));

    if (activeDirectoryHandle) {
      try {
        for (const item of finalItems) {
          await writeDirectoryVaultItem(activeDirectoryHandle, item);
        }
        await writeDirectoryVaultMeta(activeDirectoryHandle, { masteredCount: finalMasteredCount });
      } catch (err) {
        console.warn('Failed writing imported items to local directory:', err);
      }
    }

    const snapshot = {
      items: finalItems,
      masteredCount: finalMasteredCount,
      storagePath: activeDirectoryHandle ? `PC 폴더: [${activeDirectoryHandle.name}]` : ''
    };

    cacheVaultSnapshot(snapshot);
    return {
      success: true,
      importedCount: newItems.length,
      totalCount: finalItems.length,
      masteredCount: finalMasteredCount,
      snapshot
    };
  } catch (err) {
    throw new Error(`백업 파일 복원 실패: ${err.message}`);
  }
}

// --- Standard Vault API calls with fallbacks ---
async function requestVaultApi(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Vault API request failed: ${response.status}`);
  }

  return response.json();
}

function toggleLocalVaultItem(result) {
  const items = getCachedVaultItems();
  const targetId = (result?.id && typeof result.id === 'string' && result.id.trim())
    ? result.id.trim()
    : getVaultItemId(result);

  const existingIndex = items.findIndex((item) => item.id === targetId);

  let isSaved = false;
  let newItems = [];

  if (existingIndex >= 0) {
    newItems = items.filter((_, idx) => idx !== existingIndex);
    isSaved = false;
  } else {
    const newItem = {
      ...result,
      id: targetId,
      savedAt: new Date().toISOString()
    };
    newItems = [newItem, ...items];
    isSaved = true;
  }

  const snapshot = {
    items: newItems,
    masteredCount: getCachedMasteredCount(),
    storagePath: ''
  };

  cacheVaultSnapshot(snapshot);
  return { isSaved, ...snapshot };
}

function removeLocalVaultItem(itemId) {
  const items = getCachedVaultItems();
  const existingIndex = items.findIndex((item) => item.id === itemId);

  let newItems = items;
  let masteredCount = getCachedMasteredCount();

  if (existingIndex >= 0) {
    newItems = items.filter((_, idx) => idx !== existingIndex);
    masteredCount += 1;
  }

  const snapshot = {
    items: newItems,
    masteredCount,
    storagePath: ''
  };

  cacheVaultSnapshot(snapshot);
  return snapshot;
}

export function getVaultItems() {
  return getCachedVaultItems();
}

export function getMasteredCount() {
  return getCachedMasteredCount();
}

export function isItemSaved(resultOrId) {
  if (!resultOrId) return false;

  const items = getCachedVaultItems();
  const targetId = typeof resultOrId === 'string'
    ? resultOrId
    : (resultOrId.id || null);

  if (!targetId) return false;

  return items.some((item) => item.id === targetId);
}

export function subscribeToVaultChanges(listener) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event) => listener(event.detail);
  window.addEventListener(VAULT_UPDATED_EVENT, handler);

  return () => {
    window.removeEventListener(VAULT_UPDATED_EVENT, handler);
  };
}

export async function loadVaultSnapshot() {
  // 1. Web File System Access API (Google Drive / PC Folder) - Highest Priority
  if (!activeDirectoryHandle) {
    const storedHandle = await getStoredDirectoryHandle();
    if (storedHandle) {
      try {
        if ((await storedHandle.queryPermission({ mode: 'readwrite' })) === 'granted') {
          activeDirectoryHandle = storedHandle;
          pendingDirectoryHandle = null;
        } else {
          pendingDirectoryHandle = storedHandle;
        }
      } catch {
        pendingDirectoryHandle = storedHandle;
      }
    }
  }

  if (activeDirectoryHandle) {
    try {
      const snapshot = await readDirectoryVaultSnapshot(activeDirectoryHandle);
      cacheVaultSnapshot(snapshot);
      return snapshot;
    } catch (err) {
      console.warn('Directory snapshot read failed, falling back:', err);
    }
  }

  // 2. Dev Server API
  try {
    const snapshot = await requestVaultApi('/api/vault');
    cacheVaultSnapshot(snapshot);
    return snapshot;
  } catch {
    // 3. IndexedDB Fallback (Unlimited capacity)
    const idbSnapshot = await getIndexedDbVaultSnapshot();
    if (idbSnapshot && (idbSnapshot.items.length > 0 || idbSnapshot.masteredCount > 0)) {
      cacheVaultSnapshot(idbSnapshot);
      return idbSnapshot;
    }

    // 4. LocalStorage Fallback & Auto Migration to IndexedDB
    const snapshot = {
      items: getCachedVaultItems(),
      masteredCount: getCachedMasteredCount(),
      storagePath: ''
    };
    cacheVaultSnapshot(snapshot);
    return snapshot;
  }
}

export async function initVaultStorage() {
  return loadVaultSnapshot();
}

export async function saveToVault(result) {
  if (!result) {
    return {
      isSaved: false,
      items: getCachedVaultItems(),
      masteredCount: getCachedMasteredCount(),
      storagePath: activeDirectoryHandle ? `PC 폴더: [${activeDirectoryHandle.name}]` : ''
    };
  }

  // 1. Web File System Access API (Google Drive / PC Folder) - Highest Priority
  if (activeDirectoryHandle) {
    try {
      const snapshot = await readDirectoryVaultSnapshot(activeDirectoryHandle);
      const targetId = getVaultItemId(result);
      const existingIndex = snapshot.items.findIndex(
        (item) => item.id === targetId || item.arrowKorean === result.arrowKorean || item.english === result.english
      );

      let isSaved = false;
      if (existingIndex >= 0) {
        const itemToRemove = snapshot.items[existingIndex];
        await deleteDirectoryVaultItem(activeDirectoryHandle, itemToRemove.id);
        isSaved = false;
      } else {
        const newItem = {
          ...result,
          id: targetId,
          savedAt: new Date().toISOString()
        };
        await writeDirectoryVaultItem(activeDirectoryHandle, newItem);
        isSaved = true;
      }

      const newSnapshot = await readDirectoryVaultSnapshot(activeDirectoryHandle);
      cacheVaultSnapshot(newSnapshot);
      return { isSaved, ...newSnapshot };
    } catch (err) {
      console.error('Failed writing to local PC directory:', err);
    }
  }

  // 2. Dev Server API
  try {
    const snapshot = await requestVaultApi('/api/vault/toggle', {
      method: 'POST',
      body: JSON.stringify({ result })
    });

    cacheVaultSnapshot(snapshot);
    return snapshot;
  } catch (_error) {
    // 3. LocalStorage Fallback
    return toggleLocalVaultItem(result);
  }
}

export async function removeFromVault(itemId) {
  if (!itemId) {
    return {
      items: getCachedVaultItems(),
      masteredCount: getCachedMasteredCount(),
      storagePath: activeDirectoryHandle ? `PC 폴더: [${activeDirectoryHandle.name}]` : ''
    };
  }

  // 1. Web File System Access API (Google Drive / PC Folder) - Highest Priority
  if (activeDirectoryHandle) {
    try {
      await deleteDirectoryVaultItem(activeDirectoryHandle, itemId);
      const snapshot = await readDirectoryVaultSnapshot(activeDirectoryHandle);
      const newMasteredCount = (snapshot.masteredCount || 0) + 1;
      await writeDirectoryVaultMeta(activeDirectoryHandle, { masteredCount: newMasteredCount });

      const updatedSnapshot = {
        ...snapshot,
        masteredCount: newMasteredCount
      };
      cacheVaultSnapshot(updatedSnapshot);
      return updatedSnapshot;
    } catch (err) {
      console.error('Failed removing from local PC directory:', err);
    }
  }

  // 2. Dev Server API
  try {
    const snapshot = await requestVaultApi('/api/vault/remove', {
      method: 'POST',
      body: JSON.stringify({ itemId })
    });

    cacheVaultSnapshot(snapshot);
    return snapshot;
  } catch (_error) {
    // 3. LocalStorage Fallback
    return removeLocalVaultItem(itemId);
  }
}
