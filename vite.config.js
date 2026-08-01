import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const vaultDir = path.join(projectRoot, '학습자료실');
const vaultMetaFile = path.join(vaultDir, '_vault_meta.json');

function sanitizeFileName(name) {
  const withoutControlChars = Array.from(String(name || 'vault-item'))
    .map((character) => character.charCodeAt(0) < 32 ? '_' : character)
    .join('');

  const sanitized = withoutControlChars
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 120);

  return sanitized || 'vault-item';
}

function getVaultItemId(result) {
  if (result?.id && typeof result.id === 'string' && result.id.trim()) {
    return result.id.trim();
  }
  const base = result?.english || result?.arrowKorean || 'vault-item';
  const cleanBase = sanitizeFileName(base).slice(0, 30);
  return `vault_${cleanBase}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

function getVaultItemFilePath(itemId) {
  const safeName = sanitizeFileName(itemId).slice(0, 80);
  return path.join(vaultDir, `${safeName}.json`);
}

async function ensureVaultDir() {
  await fs.mkdir(vaultDir, { recursive: true });
}

async function readJsonFile(filePath, fallbackValue) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return fallbackValue;
  }
}

async function readVaultMeta() {
  return readJsonFile(vaultMetaFile, { masteredCount: 0 });
}

async function writeVaultMeta(meta) {
  await ensureVaultDir();
  await fs.writeFile(vaultMetaFile, JSON.stringify(meta, null, 2), 'utf8');
}

async function readVaultItems() {
  await ensureVaultDir();
  const entries = await fs.readdir(vaultDir, { withFileTypes: true });
  const items = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json') || entry.name === path.basename(vaultMetaFile)) {
      continue;
    }

    const item = await readJsonFile(path.join(vaultDir, entry.name), null);
    if (item) {
      if (!item.id) {
        item.id = entry.name.replace(/\.json$/, '');
      }
      items.push(item);
    }
  }

  return items.sort((left, right) => (right.savedAt || '').localeCompare(left.savedAt || ''));
}

async function findExistingVaultItem(result) {
  const items = await readVaultItems();
  const targetId = result?.id ? result.id.trim() : null;

  if (!targetId) return null;
  return items.find((item) => item.id === targetId) || null;
}

async function createVaultSnapshot() {
  const [items, meta] = await Promise.all([readVaultItems(), readVaultMeta()]);

  return {
    items,
    masteredCount: meta.masteredCount || 0,
    storagePath: vaultDir
  };
}

async function toggleVaultItem(result) {
  await ensureVaultDir();
  const existingItem = await findExistingVaultItem(result);

  if (existingItem) {
    await fs.rm(getVaultItemFilePath(existingItem.id), { force: true });
    return { isSaved: false, ...(await createVaultSnapshot()) };
  }

  const itemId = getVaultItemId(result);
  const item = {
    ...result,
    id: itemId,
    savedAt: new Date().toISOString()
  };

  await fs.writeFile(getVaultItemFilePath(itemId), JSON.stringify(item, null, 2), 'utf8');
  return { isSaved: true, ...(await createVaultSnapshot()) };
}

async function removeVaultItem(itemId) {
  await ensureVaultDir();
  const items = await readVaultItems();
  const targetItem = items.find((item) => item.id === itemId);

  if (targetItem) {
    await fs.rm(getVaultItemFilePath(targetItem.id), { force: true });
    const meta = await readVaultMeta();
    await writeVaultMeta({ ...meta, masteredCount: (meta.masteredCount || 0) + 1 });
  }

  return createVaultSnapshot();
}

async function readRequestJson(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
}

function writeJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

const apiKeyFile = path.join(projectRoot, '_api_key.json');

async function readApiKeyFromFile() {
  const data = await readJsonFile(apiKeyFile, { apiKey: '' });
  return data.apiKey || '';
}

async function writeApiKeyToFile(apiKey) {
  if (!apiKey) {
    await fs.rm(apiKeyFile, { force: true });
    return;
  }
  await fs.writeFile(apiKeyFile, JSON.stringify({ apiKey: apiKey.trim() }, null, 2), 'utf8');
}

function createVaultApiPlugin() {
  const handleVaultRequest = async (req, res, next) => {
    if (req.url?.startsWith('/api/config/key')) {
      try {
        if (req.method === 'GET') {
          const apiKey = await readApiKeyFromFile();
          writeJson(res, 200, { apiKey });
          return;
        }

        if (req.method === 'POST') {
          const { apiKey } = await readRequestJson(req);
          await writeApiKeyToFile(apiKey || '');
          writeJson(res, 200, { success: true, apiKey: apiKey || '' });
          return;
        }
      } catch (err) {
        writeJson(res, 500, { message: 'Config API request failed.', detail: err instanceof Error ? err.message : '' });
        return;
      }
    }

    if (!req.url?.startsWith('/api/vault')) {
      next();
      return;
    }

    try {
      if (req.method === 'GET' && req.url === '/api/vault') {
        writeJson(res, 200, await createVaultSnapshot());
        return;
      }

      if (req.method === 'POST' && req.url === '/api/vault/toggle') {
        const { result } = await readRequestJson(req);
        if (!result) {
          writeJson(res, 400, { message: 'result is required.' });
          return;
        }

        writeJson(res, 200, await toggleVaultItem(result));
        return;
      }

      if (req.method === 'POST' && req.url === '/api/vault/remove') {
        const { itemId } = await readRequestJson(req);
        if (!itemId) {
          writeJson(res, 400, { message: 'itemId is required.' });
          return;
        }

        writeJson(res, 200, await removeVaultItem(itemId));
        return;
      }

      writeJson(res, 404, { message: 'Vault API route not found.' });
    } catch (error) {
      writeJson(res, 500, {
        message: 'Vault API request failed.',
        detail: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return {
    name: 'cupidenglish-vault-api',
    configureServer(server) {
      server.middlewares.use(handleVaultRequest);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleVaultRequest);
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), createVaultApiPlugin()],
  server: {
    host: true,
    port: 5173,
    watch: {
      ignored: ['**/학습자료실/**', '**/_api_key.json']
    }
  },
  preview: {
    watch: {
      ignored: ['**/학습자료실/**', '**/_api_key.json']
    }
  }
});
