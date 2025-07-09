import {
  addToast,
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { FaKey } from "react-icons/fa";

import { useImportFavGifs } from "#/hooks/useImportFavGifs";
/*
const iframe = document.createElement("iframe");
console.log(
  "Token: %c%s",
  "font-size:16px;",
  JSON.parse(
    document.body.appendChild(iframe).contentWindow.localStorage.token,
  ),
);
iframe.remove();
*/

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

export default function SettingsButton() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [token, setToken] = useLocalStorage<string>("token");
  const [settings, setSettings] = useLocalStorage<{
    overwriteFavoriteGifs: boolean;
  }>("settings", {
    overwriteFavoriteGifs: false,
  });

  const { mutateAsync: importGifs } = useImportFavGifs();

  const onImportClick = async () => {
    addToast({
      title: "Importing...",
      promise: importGifs(
        { overwrite: settings.overwriteFavoriteGifs },
        {
          onSuccess({ addedCount, overwrite }) {
            if (addedCount === 0) {
              addToast({
                title: "Import Complete",
                description:
                  "All your favorite GIFs were already imported. No new ones were added.",
                color: "warning",
              });
              return;
            }

            addToast({
              title: "Import Complete",
              description: `${addedCount} new favorite GIF${addedCount !== 1 ? "s" : ""} added successfully.${
                overwrite
                  ? " Some existing favorite GIFs have been overwritten."
                  : ""
              }`,
              color: "success",
            });
          },
          onError() {
            addToast({
              title: "Import Failed",
              description: "Your favorite GIF has not been imported.",
              color: "danger",
            });
          },
        },
      ),
      timeout: 1,
    });
  };

  function onTestClick() {
    addToast({
      title: "Import Success",
      description: "Your favorite GIF has been imported.",
      color: "success",
      timeout: 1000,
    });
  }

  return (
    <>
      <Button color="primary" variant="flat" onPress={onOpen}>
        Settings
      </Button>
      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Settings
              </ModalHeader>
              <ModalBody>
                <Input
                  endContent={
                    <FaKey className="text-xl text-default-400 flex-shrink-0" />
                  }
                  value={token ?? ""}
                  onChange={(e) => {
                    setToken(e.target.value);
                  }}
                  label="API Key"
                  placeholder="Enter your API key"
                  type="password"
                  variant="bordered"
                />

                <div className="flex py-2 px-1 justify-between">
                  <Checkbox
                    classNames={{
                      label: "text-small",
                    }}
                    isSelected={settings.overwriteFavoriteGifs}
                    onValueChange={(value) => {
                      setSettings({
                        ...settings,
                        overwriteFavoriteGifs: value,
                      });
                    }}
                  >
                    Overwrite favorite GIFs
                  </Checkbox>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onTestClick}>
                  Test
                </Button>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" variant="solid" onPress={onImportClick}>
                  Import Favorite GIFs
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
