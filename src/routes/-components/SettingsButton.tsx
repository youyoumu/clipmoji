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

import { useUpdateCachedBlobs } from "#/hooks/useCachedBlobs";
import {
  useExportFavoriteGifs,
  useUpdateFavoriteGifs,
} from "#/hooks/useFavoriteGifs";
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
  const [settings, setSettings] = useSettings();

  function onTestClick() {
    addToast({
      title: "Fetching...",
      color: "default",
      timeout: 20000,
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
                <div className="flex py-2 px-1 flex-col gap-4">
                  <CheckboxSetting
                    settingKey="overwriteFavoriteGifs"
                    text="Overwrite favorite GIFs"
                  />
                  <CheckboxSetting
                    settingKey="showDeadLinks"
                    text="Show dead links"
                  />
                  <CheckboxSetting
                    settingKey="smoothScroll"
                    text="Smooth scrolling"
                  />
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

function CheckboxSetting({
  settingKey,
  text,
}: {
  settingKey: keyof ReturnType<typeof useSettings>[0];
  text: string;
}) {
  const [settings, setSettings] = useSettings();
  return (
    <Checkbox
      classNames={{
        label: "text-small",
      }}
      isSelected={settings[settingKey]}
      onValueChange={(value) => {
        if (typeof settings[settingKey] !== "boolean") return;
        setSettings({
          ...settings,
          [settingKey]: value,
        });
      }}
    >
      {text}
    </Checkbox>
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
  const [settings] = useSettings();
  const { mutateAsync: importGifs, isPending } = useUpdateFavoriteGifs();

  const { mutateAsync: updateCachedBlobs } = useUpdateCachedBlobs();

  function updateCachedBlobsWithToast() {
    addToast({
      title: "Fetching...",
      promise: updateCachedBlobs(undefined, {
        onSuccess({ addedCount, errorCount }) {
          addToast({
            title: "Fetch Complete",
            description: `${addedCount} favorite GIF${addedCount > 1 ? "s" : ""} has been cached locally. Failed to fetch ${errorCount} GIF${addedCount > 1 ? "s" : ""}.`,
            color: "warning",
          });
        },
      }),
      color: "default",
      timeout: 1000,
    });
  }

  const onImportClick = async () => {
    addToast({
      title: "Importing...",
      promise: importGifs(
        { overwrite: settings.overwriteFavoriteGifs },
        {
          onSuccess({ addedCount, updatedCount, overwrite }) {
            addToast({
              title: "Import Complete",
              description: `${overwrite ? "Existing favorite GIFs have been overwritten." : ""} ${addedCount} added, ${updatedCount} updated.`,
              color: "success",
            });
            updateCachedBlobsWithToast();
          },
          onError() {
            addToast({
              title: "Import Failed",
              description:
                "Something when wrong while importing your favorite GIFs.",
              color: "danger",
            });
          },
        },
      ),
      timeout: 1,
    });
  };

  return (
    <Button
      color="primary"
      variant="solid"
      onPress={onImportClick}
      isLoading={isPending}
    >
      Import Favorite GIFs
    </Button>
  );
}

function ExportButton() {
  const { mutateAsync: exportGifs, isPending } = useExportFavoriteGifs();

  function onExportClick() {
    addToast({
      title: "Exporting...",
      promise: exportGifs(undefined, {
        onSuccess() {
          addToast({
            title: "Export Complete",
            description: "Your favorite GIFs have been exported to a zip file.",
            color: "success",
          });
        },
        onError() {
          addToast({
            title: "Export Failed",
            description:
              "Something went wrong while exporting your favorite GIFs.",
            color: "danger",
          });
        },
      }),
      timeout: 1,
    });
  }

  return (
    <Button
      color="primary"
      variant="solid"
      onPress={onExportClick}
      isLoading={isPending}
    >
      Export Favorite GIFs
    </Button>
  );
}
