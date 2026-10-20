"use client";

import App from "@/src/feature/think/components/editor/App";
import { SubmitButton } from "@/src/shared/components/ui/Button";

export default function MainBar() {
  return (
    <div className="flex-1 bg-content relative top-0 overflow-y-auto">
      <div className="h-full w-full p-8 overflow-y-auto"><App/></div>
      <SubmitButton content="コミット" size="free" className="scale-125 absolute right-8 bottom-6 z-10"/>
    </div>
  );
}