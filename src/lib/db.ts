import Dexie, { type EntityTable } from "dexie";

const db = new Dexie("ClipmojiDatabase") as Dexie & {
  favGif: EntityTable<FavGif, "id">;
  cachedBlob: EntityTable<CachedBlob, "id">;
};

db.version(1).stores({
  favGif: "++id, key, src, width, height, type",
  cachedBlob: "++id, src, blob",
});

export type FavGif = {
  id: number;
  key: string;
  src: string;
  order: number;
  width: number;
  height: number;
  type: "gif" | "mp4";
};

export type CachedBlob = {
  id: number;
  src: string;
  blob: Blob;
};

export { db };
