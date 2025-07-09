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
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useLocalStorage, useToggle } from "@uidotdev/usehooks";

import { useExportFavGifs } from "#/hooks/useExportFavGifs";
import { useImportFavGifs } from "#/hooks/useImportFavGifs";
import { useSettings } from "#/hooks/useSettings";
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

export default function SettingsButton() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { settings, setSettings } = useSettings();

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
      <Modal
        isOpen={isOpen}
        placement="top-center"
        onOpenChange={onOpenChange}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Settings
              </ModalHeader>
              <ModalBody>
                <APIKeyInput />
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
                <ExportButton />
                <ImportButton />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

function APIKeyInput() {
  const [token, setToken] = useLocalStorage<string>("token");
  const [visible, toggle] = useToggle(false);

  return (
    <Input
      endContent={
        visible ? (
          <IconEyeOff onClick={() => toggle()} className="cursor-pointer" />
        ) : (
          <IconEye onClick={() => toggle()} className="cursor-pointer" />
        )
      }
      value={token ?? ""}
      onChange={(e) => {
        setToken(e.target.value);
      }}
      label="API Key"
      placeholder="Enter your API key"
      type={visible ? "text" : "password"}
      variant="bordered"
    />
  );
}

function ImportButton() {
  const { settings } = useSettings();
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

  return (
    <Button color="primary" variant="solid" onPress={onImportClick}>
      Import Favorite GIFs
    </Button>
  );
}

function ExportButton() {
  const { mutateAsync: exportGifs } = useExportFavGifs();

  function onExportClick() {
    exportGifs();
  }

  return (
    <Button color="primary" variant="solid" onPress={onExportClick}>
      Export Favorite GIFs
    </Button>
  );
}
