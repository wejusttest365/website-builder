import { nanoid } from "nanoid";

export interface BuilderImageReference {
  imageId?: string;
  sourceType: "upload" | "remote" | "stock" | "builderAsset";
  src: string;
  url?: string;
  filename: string;
  mimeType?: string;
  provider?: string;
  attribution?: string;
  previewSrc?: string;
  isPreview?: boolean;
  isWatermarked?: boolean;
}

export type BuilderAssetEntry = BuilderImageReference | string;

const DB_NAME = "wto-builder-db";
const DB_STORE = "images";
const DB_VERSION = 2;
const objectUrlCache = new Map<string, string>();

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, data] = dataUrl.split(",");
  const mime = /data:([^;]+);/.exec(meta)?.[1] || "application/octet-stream";
  const isBase64 = meta.includes(";base64");
  const body = isBase64 ? atob(data) : decodeURIComponent(data);
  const bytes = new Uint8Array(body.length);
  for (let i = 0; i < body.length; i += 1) bytes[i] = body.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function extensionFromMime(mimeType: string, extHint?: string) {
  const hinted = extHint?.replace(/^\./, "").toLowerCase();
  if (hinted) return hinted;
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
  };
  return map[mimeType] || "bin";
}

function sanitizeAssetName(value: string) {
  return value
    .replace(/[\\/]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

function getBaseName(filename?: string) {
  const raw = filename?.split(/[\\/]/).pop() ?? "";
  if (!raw) return "";
  const dot = raw.lastIndexOf(".");
  return dot > 0 ? raw.slice(0, dot) : raw;
}

function getExtension(filename?: string, mimeType?: string) {
  const raw = filename?.split(/[\\/]/).pop() ?? "";
  const dot = raw.lastIndexOf(".");
  if (dot > 0 && dot < raw.length - 1) {
    return raw.slice(dot + 1).toLowerCase();
  }
  return extensionFromMime(mimeType ?? "image/png");
}

function createFilename(ext: string, hint?: string, seed = nanoid(6)) {
  const hintBase = getBaseName(hint);
  const base = sanitizeAssetName(hintBase || hint || `image-${seed}`) || `image-${seed}`;
  return `${base}.${ext}`;
}

function getFilenameFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    const raw = parsed.pathname.split("/").filter(Boolean).pop() || "image.png";
    const ext = getExtension(raw);
    return createFilename(ext, raw);
  } catch {
    const fallback = url.split("?")[0].split("#")[0].split("/").filter(Boolean).pop() || "image.png";
    const ext = getExtension(fallback);
    return createFilename(ext, fallback);
  }
}

export function createRemoteImageReference(url: string): BuilderImageReference {
  return {
    sourceType: "remote",
    src: url,
    url,
    filename: getFilenameFromUrl(url),
    provider: "Remote image",
    attribution: "",
    isPreview: false,
    isWatermarked: false,
  };
}

export function createStockImageReference(url: string): BuilderImageReference {
  return {
    sourceType: "stock",
    src: url,
    url,
    filename: getFilenameFromUrl(url),
    provider: "Builder stock preview",
    attribution: "",
    isPreview: true,
    isWatermarked: true,
  };
}

function openImageDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not available"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE, { keyPath: "imageId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
  });
}

function closeDb(db: IDBDatabase | null) {
  if (db) db.close();
}

export function createImageAssetReference(dataUrl: string, filenameHint?: string): { ref: BuilderImageReference; blob: Blob } {
  const mimeMatch = /^data:([^;]+);/.exec(dataUrl);
  const mimeType = mimeMatch?.[1] || "image/png";
  const ext = getExtension(filenameHint, mimeType);
  const filename = createFilename(ext, filenameHint);
  const imageId = `img-${nanoid(8)}`;
  const blob = dataUrlToBlob(dataUrl);
  const ref: BuilderImageReference = {
    imageId,
    sourceType: "upload",
    src: `builder://images/${filename}`,
    filename,
    mimeType,
  };
  Object.defineProperty(ref, "previewSrc", {
    value: dataUrl,
    enumerable: false,
    configurable: true,
  });
  return { ref, blob };
}

export async function saveImageBlob(imageId: string, filename: string, blob: Blob, mimeType: string) {
  const db = await openImageDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      const store = tx.objectStore(DB_STORE);
      const request = store.put({ imageId, filename, mimeType, blob, createdAt: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error || new Error("Failed to save image"));
    });
  } finally {
    closeDb(db);
  }
}

export async function getImageBlob(imageId: string): Promise<Blob | null> {
  const db = await openImageDb();
  try {
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readonly");
      const store = tx.objectStore(DB_STORE);
      const request = store.get(imageId);
      request.onsuccess = () => resolve(request.result?.blob ?? null);
      request.onerror = () => reject(request.error || new Error("Failed to load image"));
    });
  } catch {
    return null;
  } finally {
    closeDb(db);
  }
}

export async function getImageObjectUrl(imageId: string): Promise<string | null> {
  const cached = objectUrlCache.get(imageId);
  if (cached) return cached;
  const blob = await getImageBlob(imageId);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  objectUrlCache.set(imageId, url);
  return url;
}

export function getAssetValue(entry?: BuilderAssetEntry): string | undefined {
  if (!entry) return undefined;
  if (typeof entry === "string") return entry;
  if (typeof entry.url === "string" && /^(data:|https?:|blob:)/i.test(entry.url)) return entry.url;
  if (typeof entry.previewSrc === "string" && /^(data:|https?:|blob:)/i.test(entry.previewSrc)) return entry.previewSrc;
  if (typeof entry.src === "string") {
    if (/^(data:|https?:|blob:)/i.test(entry.src)) return entry.src;
    if (/^builder:\/\/images\//.test(entry.src) && entry.filename) return `images/${entry.filename}`;
    if (entry.sourceType === "upload" && entry.filename) return `images/${entry.filename}`;
    return entry.src;
  }
  return undefined;
}

export async function resolveAssetValue(entry?: BuilderAssetEntry): Promise<string | undefined> {
  const value = getAssetValue(entry);
  if (!value) return undefined;
  if (/^builder:\/\/images\//.test(value) && typeof entry !== "string" && entry.imageId) {
    const objectUrl = await getImageObjectUrl(entry.imageId);
    return objectUrl ?? value;
  }
  return value;
}

export async function resolveAssetUrls(assets?: Record<string, BuilderAssetEntry>): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};
  if (!assets) return urls;
  for (const [name, entry] of Object.entries(assets)) {
    const resolved = await resolveAssetValue(entry);
    if (resolved) urls[name] = resolved;
  }
  return urls;
}

export function revokeAllObjectUrls() {
  for (const url of objectUrlCache.values()) {
    URL.revokeObjectURL(url);
  }
  objectUrlCache.clear();
}

function isBuilderImageReference(value: unknown): value is BuilderImageReference {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as any).src === "string" &&
    typeof (value as any).filename === "string"
  );
}

export function normalizeAssetMap(assets?: Record<string, unknown>): Record<string, BuilderAssetEntry> | undefined {
  if (!assets || typeof assets !== "object") return undefined;
  const normalized: Record<string, BuilderAssetEntry> = {};
  for (const [name, value] of Object.entries(assets)) {
    if (isBuilderImageReference(value)) {
      normalized[name] = value;
      continue;
    }
    if (typeof value === "string" && value.startsWith("data:")) {
      const { ref, blob } = createImageAssetReference(value, name);
      void saveImageBlob(ref.imageId, ref.filename, blob, ref.mimeType);
      normalized[name] = ref;
      continue;
    }
    if (typeof value === "string") {
      normalized[name] = value;
    }
  }
  return Object.keys(normalized).length ? normalized : undefined;
}
