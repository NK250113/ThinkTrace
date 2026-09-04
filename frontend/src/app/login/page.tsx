import { AppLogo } from "@/src/shared/components/ui/Title";

import { LoginForm } from "@/src/feature/auth/components/Form";

export default function UsersPage() {
    return (
        <div className="w-2/3 gap-10 flex flex-col justify-center items-center bg-(--content-bg) rounded-2xl py-10 px-10">
            <AppLogo></AppLogo>
            <LoginForm></LoginForm>
        </div>
    );
}