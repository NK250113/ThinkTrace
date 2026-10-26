"use client";
import { useState, type ReactNode } from "react";

export function BaseModal({on, fn, children}: {on: boolean; fn: (event: React.MouseEvent<HTMLDivElement>) => void; children: ReactNode;}) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs ${on ? "" : "hidden"}`} onClick={fn}>
      <div className="w-full max-w-md rounded-xl shadow-line shadow-[0_0_5px] overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export function SettingModal({on, fn}: {on: boolean; fn: (event: React.MouseEvent<HTMLDivElement>) => void;}) {
  const [activeTab, setActiveTab] = useState(0);
  const labels = ["a", "b", "c"];
  const contents = [
    <></>,
  ]
  return (
    <BaseModal on={on} fn={fn}>
      <div className="flex">
        <div className="flex flex-col bg-content w-max">
          {labels.map((item, idx) => (
            <p key={idx} onClick={() => setActiveTab(idx)}
            className={`px-2 py-1 border-b border-line ${activeTab === idx ? "bg-subcontent" : "border-r"} cursor-pointer whitespace-nowrap`}>
            {item}</p>
          ))}
          <div className="flex-1 border-r"/>
        </div>
        <div className="bg-subcontent flex-1">
          <p>aa</p>
        </div>
      </div>
    </BaseModal>
  );
}