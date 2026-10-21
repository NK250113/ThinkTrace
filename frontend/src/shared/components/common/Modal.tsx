"use client";
import type { ReactNode } from "react";

export function BaseModal({children}: {children: ReactNode}) {
  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
      {children}
    </div>
  </div>
  )
}