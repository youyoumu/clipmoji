import Dexie, { type EntityTable } from "dexie";

const db = new Dexie("ClipmojiDatabase") as Dexie & {
  favGif: EntityTable<FavGif, "id">;
  cachedBlob: EntityTable<CachedBlob, "id">;
  favGifNote: EntityTable<FavGifNote, "id">;
};

db.version(1).stores({
  favGif: "++id, key, src, width, height, type",
  favGifNote: "++id, key, note",
  cachedBlob: "++id, src, blob, httpStatus",
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

export type FavGifNote = {
  id: number;
  key: string;
  note: string;
};

export type CachedBlob = {
  id: number;
  src: string;
  blob: Blob | null;
  httpStatus: number | null;
};

export { db };
