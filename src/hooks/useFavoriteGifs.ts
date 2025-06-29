import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";

import { db } from "#/lib/db";

import { cachedBlobQueryOptions } from "./useCachedBlob";

export const favGifsQueryOptions = queryOptions({
  queryKey: ["favoriteGifs"],
  queryFn() {
    return db.favGif.toArray();
  },
});

export function useFavoriteGifs() {
  return useQuery({
    ...favGifsQueryOptions,
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
