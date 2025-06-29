import Dexie, { type EntityTable } from "dexie";

const db = new Dexie("ClipmojiDatabase") as Dexie & {
  favGif: EntityTable<
    FavGif,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  favGif: "++id, key, src, width, height, type", // primary key "id" (for the runtime!)
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

export { db };
