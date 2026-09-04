"use client";

import { SubmitButton } from "@/src/shared/components/ui/Button";

import { AuthText } from "./Text";

import { useLogin } from "./../hooks";

export function LoginForm() {
    const { email, password, error, isFormValid, emailHandler, passwordHandler, submit } = useLogin();
    return (
        <div className="flex flex-col gap-6">
            <h3 className="text-xl">メールアドレスでログイン</h3>
            <form onSubmit={submit}
            className="flex flex-col items-center gap-3">
                <AuthText type="email" value={email} onChange={emailHandler}
                placeholder="メールアドレス"
                autoComplete="email"/>
                <AuthText type="password" value={password} onChange={passwordHandler}
                placeholder="パスワード"
                autoComplete="password"/>
                <p className="pb-4 text-red-500 text-sm">{error}</p>
                <SubmitButton content="ログイン" size="fit" disabled={!isFormValid}/>
            </form>
        </div>
    );
}