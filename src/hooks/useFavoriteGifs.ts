import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";

import { db } from "#/lib/db";

import { cachedBlobQueryOptions } from "./useCachedBlob";
import { useFavGifNotes } from "./useFavGifNote";

export const favGifsQueryOptions = queryOptions({
  queryKey: ["favoriteGifs"],
  async queryFn() {
    return await db.favGif.toArray();
  },
});

export function useFavoriteGifs() {
  const { data: favGifNotes = [], isLoading: L1 } = useFavGifNotes();

  return useQuery({
    ...favGifsQueryOptions,
    select(favGifs) {
      return favGifs.map((favGif) => {
        const favGifNote = favGifNotes.find((item) => item.key === favGif.key);
        return Object.assign(favGif, {
          note: favGifNote?.note ?? "",
        });
      });
    },
    enabled: !L1,
  });
}

export function useFavoriteGifsWithBlob() {
  const queryClient = useQueryClient();
  const { data: favoriteGifs = [], isLoading: L1 } = useFavoriteGifs();

  return useQuery({
    queryKey: [],
    async queryFn() {
      const filtered = (
        await Promise.all(
          favoriteGifs.map(async (item) => {
            const cachedBlob = await queryClient.fetchQuery(
              cachedBlobQueryOptions({ src: item.src }),
            );

            return cachedBlob ? item : null;
          }),
        )
      ).filter((item) => !!item);

      return filtered;
    },
    enabled: !L1,
  });
}
