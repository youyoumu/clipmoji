import { useQuery } from "@tanstack/react-query";
import wretch from "wretch";

import { db } from "#/lib/db";

export function useCachedBlob(src: string) {
  return useQuery({
    queryKey: ["cachedBlob", { src }],
    async queryFn() {
      const cachedBlob = await db.cachedBlob.where("src").equals(src).first();
      if (cachedBlob) return cachedBlob.blob;
      const blob = await wretch(src)
        .options({ mode: "cors" })
        .get()
        .blob()
        .catch(async (error) => {
          if (error instanceof wretch.WretchError) {
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
}
