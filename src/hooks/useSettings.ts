import { useLocalStorage } from "@uidotdev/usehooks";

const defaultSettings = {
  overwriteFavoriteGifs: false,
  showDeadLinks: false,
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<typeof defaultSettings>(
    "settings",
    defaultSettings,
  );

  return { settings, setSettings };
}
