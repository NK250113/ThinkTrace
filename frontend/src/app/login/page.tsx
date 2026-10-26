"use client";
import { AppLogo } from "@/src/shared/components/ui/Title";

import { LoginForm } from "@/src/feature/auth/components/Form";
import { useLogin } from "@/src/feature/auth/hooks";

export default function UsersPage() {
  const auth = useLogin();
  return (
    <div className="w-2/3 gap-10 flex flex-col justify-center items-center bg-content rounded-2xl py-10 px-10">
      <AppLogo className="h-18"/>
      <LoginForm {...auth}/>
    </div>
  );
}