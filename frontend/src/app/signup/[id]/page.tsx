import { AppLogo } from "@/src/shared/components/ui/Title";

import { SignupForm } from "@/src/feature/auth/components/Form";

export default function UsersPage(params:{
    params: Promise<{ id: string }>
}) {
    return (
        <div className="w-2/3 gap-10 flex flex-col justify-center items-center bg-content rounded-2xl py-10 px-10">
            <AppLogo h="4xl"></AppLogo>
            <SignupForm></SignupForm>
        </div>
    );
}