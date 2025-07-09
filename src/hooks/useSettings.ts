import { useLocalStorage } from "@uidotdev/usehooks";

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<{
    overwriteFavoriteGifs: boolean;
  }>("settings", {
    overwriteFavoriteGifs: false,
  });

  return { settings, setSettings };
}
