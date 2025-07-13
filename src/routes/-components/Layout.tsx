import {
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/react";
import { type ReactNode, useState } from "react";

import SettingsButton from "./SettingsButton";

export default function Layout({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <Navbar onMenuOpenChange={setIsMenuOpen} isBordered>
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <NavbarBrand>
            <div className="text-2xl font-leckerli-one">Clipmoji</div>
          </NavbarBrand>
        </NavbarContent>
        <NavbarMenu>
          <NavbarMenuItem>
            <SettingsButton
              renderTrigger={(onOpen) => {
                return (
                  <Button onPress={onOpen} variant="light" color="primary">
                    Settings
                  </Button>
                );
              }}
            />
          </NavbarMenuItem>
        </NavbarMenu>

        <NavbarContent
          className="hidden sm:flex gap-4"
          justify="center"
        ></NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem className="hidden sm:block">
            <SettingsButton />
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      {children}
    </>
  );
}
