"use client";

import type { SubmitEventHandler } from "react";

import { ErrorMessage } from "@/src/shared/components/common/TextContent";
import { SubmitButton } from "@/src/shared/components/ui/Button";

import { useCheckEmail, useLogin, useSignup } from "./../hooks";

type AuthFormProps = {
    title: string;
    submit: SubmitEventHandler<HTMLFormElement>;
    error: string;
    buttonTxt: string;
    isFormValid: boolean;
    children: React.ReactNode;
}
function AuthForm({title, submit, error, buttonTxt, isFormValid, children}: AuthFormProps) {
    return (
        <div className="flex flex-col gap-6">
            <h3 className="text-xl">{title}</h3>
            <form onSubmit={submit}
            className="flex flex-col items-center gap-3">
                {children}
                <ErrorMessage error={error}></ErrorMessage>
                <SubmitButton content={buttonTxt} size="fit" disabled={!isFormValid}/>
            </form>
        </div>
    );
}

function AuthText(props: React.ComponentProps<"input">) {
    return (
        <input
            {...props}
            autoCapitalize="off" // 頭文字を大文字にしない
            className = "w-full rounded-sm bg-subcontent border-2 focus-visible:outline-none focus-visible:border-accent"
        />
    );
}

export function LoginForm() {
    const { email, password, error, isFormValid, emailHandler, passwordHandler, submit } = useLogin();
    return (
        <AuthForm title="メールアドレスでログイン" submit={submit} error={error} buttonTxt="ログイン" isFormValid={isFormValid}>
            <AuthText type="email" value={email} onChange={emailHandler}
            placeholder="メールアドレス"
            autoComplete="email"/>
            <AuthText type="password" value={password} onChange={passwordHandler}
            placeholder="パスワード"
            autoComplete="password"/>
        </AuthForm>
    );
}

export function SignupForm() {
    const { email, password, username, error, isFormValid, emailHandler, passwordHandler, usernameHandler, submit } = useSignup();
    return (
        <AuthForm title="メールアドレスで新規登録" submit={submit} error={error} buttonTxt="新規登録" isFormValid={isFormValid}>
            <AuthText type="email" value={email} onChange={emailHandler}
            placeholder="メールアドレス"
            autoComplete="email" disabled={true}/>
            <AuthText type="text" value={username} onChange={usernameHandler}
            placeholder="ユーザ名"
            autoComplete="email"/>
            <AuthText type="password" value={password} onChange={passwordHandler}
            placeholder="パスワード"
            autoComplete="password"/>
        </AuthForm>
    );
}

export function CheckEmailForm() {
    const { email, error, isFormValid, emailHandler, submit } = useCheckEmail();
    return (
        <>
        <AuthForm title="メールアドレスで新規登録" submit={submit} error={error} buttonTxt="確認用メールを送信" isFormValid={isFormValid}>
            <AuthText type="email" value={email} onChange={emailHandler}
            placeholder="メールアドレス"
            autoComplete="email" disabled={true}/>
        </AuthForm>
        <div>
            <h4 className="text-lg">登録の流れ</h4>
            <p>① メールアドレスを入力</p>
            <p className="opacity-50">② 届いたメールから登録ページへ<br/>③ 必要情報を入力して登録</p>
        </div>
        </>
    );
}