import { useLocalStorage } from "@uidotdev/usehooks";

const defaultSettings = {
  overwriteFavoriteGifs: false,
  showDeadLinks: false,
  smoothScroll: true,
};

export function useSettings() {
  return useLocalStorage<Partial<typeof defaultSettings>>(
    "settings",
    defaultSettings,
  );
}
