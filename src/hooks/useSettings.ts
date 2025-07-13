import { useLocalStorage } from "@uidotdev/usehooks";

const defaultSettings = {
  overwriteFavoriteGifs: false,
  showDeadLinks: true,
  smoothScroll: false,
};

export function useSettings() {
  return useLocalStorage<Partial<typeof defaultSettings>>(
    "settings",
    defaultSettings,
  );
}

export function useToken() {
  return useLocalStorage<string>("token");
}
