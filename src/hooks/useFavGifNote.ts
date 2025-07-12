import { useMutation, useQuery } from "@tanstack/react-query";

import { db } from "#/lib/db";

export function useFavGifNote({ key }: { key: string }) {
  return useQuery({
    queryKey: ["favGifNote", { key }],
    async queryFn() {
      const favGifNote = await db.favGifNote.get({ key });
      return favGifNote ?? null;
    },
  });
}

export function useUpdateFavGifNote() {
  return useMutation({
    async mutationFn({ key, note }: { key: string; note: string }) {
      let updated = false;
      const favGifNote = await db.favGifNote.get({ key });
      if (favGifNote) {
        if (note !== favGifNote.note) {
          db.favGifNote.update(favGifNote.id, {
            note,
          });
          updated = true;
        }
      } else {
        db.favGifNote.add({
          key,
          note,
        });
      }

      return {
        updated,
        note,
      };
    },
  });
}
