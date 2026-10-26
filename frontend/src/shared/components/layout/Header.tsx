import { useState } from "react";
import { IconUser, IconSettings } from "@tabler/icons-react";

import { AppLogo } from "./../ui/Title";
import { SettingModal } from "./../common/Modal";

export function Header() {
  const [settingMode, setSettingMode] = useState<boolean>(false);
  const closeModal = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    setSettingMode(false);
  };
  return (
    <header className="h-18 w-full shrink-0 bg-content">
      <div className="bg-accent/10 w-full h-full px-4 border-b-4 border-foreground border-double flex justify-between">
        <AppLogo className="h-full"/>
        <div className="flex gap-6">
          <div className="flex items-center"><IconUser className="size-6"/><p className="text-nowrap">ユーザ名</p></div>
          <button type="button" onClick={()=>setSettingMode(true)} className="block"><IconSettings className="size-8 rotate-[22.5deg]"/></button>
        </div>
      </div>
      <SettingModal on={settingMode} fn={closeModal}/>
    </header>
  );
}