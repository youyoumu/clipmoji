import { queryOptions, useQuery } from "@tanstack/react-query";

import { db } from "#/lib/db";

import { useCachedBlobs } from "./useCachedBlob";
import { useFavGifNotes } from "./useFavGifNote";

export const favGifsQueryOptions = queryOptions({
  queryKey: ["favoriteGifs"],
  async queryFn() {
    return await db.favGif.toArray();
  },
});

export function useFavoriteGifs({
  withCacheBlob,
}: {
  withCacheBlob?: boolean;
} = {}) {
  const { data: favGifNotes = [], isLoading: L1 } = useFavGifNotes();
  const { data: cachedBlobs = [] } = useCachedBlobs();

  return useQuery({
    ...favGifsQueryOptions,

    select(favGifs) {
      const favGifsWithNote = favGifs.map((favGif) => {
        const favGifNote = favGifNotes.find((item) => item.key === favGif.key);
        return Object.assign(favGif, {
          note: favGifNote?.note ?? "",
        });
      });
      if (!withCacheBlob) return favGifsWithNote;
      return favGifsWithNote.filter((favGif) => {
        const cachedBlob = cachedBlobs.find(
          (item) => item.src === favGif.src,
        )?.blob;
        return !!cachedBlob;
      });
    },
    enabled: !L1,
  });
}
