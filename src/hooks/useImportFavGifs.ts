import { useMutation } from "@tanstack/react-query";
import { useLocalStorage } from "@uidotdev/usehooks";
import protobuf from "protobufjs";
import wretch from "wretch";

import { db } from "#/lib/db";

type FrecentyUserSettings = {
  favoriteGifs: {
    gifs: Record<
      string,
      {
        format: 1 | 2;
        height: number;
        width: number;
        order: number;
        src: string;
      }
    >;
  };
};

export function useImportFavGifs() {
  const [token] = useLocalStorage<string>("token");

  return useMutation({
    mutationFn: async ({ overwrite }: { overwrite?: boolean }) => {
      const json = (await wretch(
        "https://discord.com/api/v9/users/@me/settings-proto/2",
        {
          headers: {
            Authorization: token,
          },
        },
      )
        .get()
        .json()) as { settings: string };

      const protobufBinary = Uint8Array.from(atob(json.settings), (c) =>
        c.charCodeAt(0),
      );

      const protoSchemaUrl =
        "https://raw.githubusercontent.com/discord-userdoccers/discord-protos/768905de3b7e7b00847cd242d9b7584976017b92/discord_protos/discord_users/v1/FrecencyUserSettings.proto";
      const protoSchema = await wretch(protoSchemaUrl).get().text();
      const root = protobuf.parse(protoSchema).root;

      const Message = root.lookupType(
        "discord_protos.discord_users.v1.FrecencyUserSettings",
      );
      const decoded = Message.decode(
        protobufBinary,
      ) as unknown as FrecentyUserSettings;
      const favoriteGifs = Object.entries(decoded.favoriteGifs.gifs);

      const currentFavGifs = await db.favGif.toArray();
      const currentFavGifKeys = currentFavGifs.map((favGiv) => favGiv.key);

      const filteredFavGif = favoriteGifs.filter(
        ([key]) => !currentFavGifKeys.includes(key),
      );

      for (const [key, value] of filteredFavGif) {
        await db.favGif.add({
          key: key,
          src: value.src,
          order: value.order,
          type: value.format === 1 ? "gif" : "mp4",
          height: value.height,
          width: value.width,
        });
      }

      return {
        addedCount: filteredFavGif.length,
        overwrite: true,
      };
    },
  });
}
