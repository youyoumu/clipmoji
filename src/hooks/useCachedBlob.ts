import { queryOptions, useQuery } from "@tanstack/react-query";
import wretch from "wretch";

import { db } from "#/lib/db";

export const cachedBlobQueryOptions = ({ src }: { src: string }) =>
  queryOptions({
    queryKey: ["cachedBlob", { src }],
    async queryFn() {
      const cachedBlob = await db.cachedBlob.where("src").equals(src).first();
      if (cachedBlob) return cachedBlob.blob;
      const blob = await wretch(src)
        .get()
        .blob()
        .catch(async (error) => {
          if (error instanceof wretch.WretchError) {
            // if status is 404, add it to the database
            if (error.status === 404) {
              await db.cachedBlob.add({
                src: src,
                blob: null,
                httpStatus: error.status,
              });
            }
            return null;
          }
          if (error instanceof TypeError) {
            if (error.message === "Failed to fetch") {
              // this could be cors error, fetch again with free cors proxy
              // NOTE: this proxy is dead
              return null;
              const blob = await wretch("https://crossorigin.me/" + src)
                .get()
                .blob()
                .catch(async (error) => {
                  if (error instanceof wretch.WretchError) {
                    // if status is 404, add it to the database
                    if (error.status === 404) {
                      await db.cachedBlob.add({
                        src: src,
                        blob: null,
                        httpStatus: error.status,
                      });
                    }
                    return null;
                  }
                  return null;
                });
              return blob;
            }
            return null;
          }
          return null;
        });
      if (!blob) return null;
      const allowedBlobTypes = ["image/gif", "video/mp4"];
      if (allowedBlobTypes.includes(blob.type)) {
        await db.cachedBlob.add({
          src: src,
          blob: blob,
          httpStatus: null,
        });
        return blob;
      }
      return null;
    },
  });

export function useCachedBlob(src: string) {
  return useQuery({
    ...cachedBlobQueryOptions({ src }),
  });
}
