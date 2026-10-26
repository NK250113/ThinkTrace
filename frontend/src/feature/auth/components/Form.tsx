"use client";

import type { ReactNode, SubmitEventHandler } from "react";

import { ErrorMessage } from "@/src/shared/components/common/TextContent";
import { SubmitButton } from "@/src/shared/components/ui/Button";
import { InputText } from "@/src/shared/components/ui/Text";

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



export function LoginForm({ email, password, error, isFormValid, emailHandler, passwordHandler, submit }: ReturnType<typeof useLogin>) {
  return (
    <AuthForm title="メールアドレスでログイン" submit={submit} error={error} buttonTxt="ログイン" isFormValid={isFormValid}>
      <InputText type="email" value={email} onChange={emailHandler}
      placeholder="メールアドレス"
      autoComplete="email"/>
      <InputText type="password" value={password} onChange={passwordHandler}
      placeholder="パスワード"
      autoComplete="password"/>
    </AuthForm>
  );
}

export function SignupForm({email, password, username, error, isFormValid, emailHandler, passwordHandler, usernameHandler, submit}: ReturnType<typeof useSignup>) {
  return (
    <AuthForm title="メールアドレスで新規登録" submit={submit} error={error} buttonTxt="新規登録" isFormValid={isFormValid}>
      <InputText type="email" value={email} onChange={emailHandler}
      placeholder="メールアドレス"
      autoComplete="email" disabled={true}/>
      <InputText type="text" value={username} onChange={usernameHandler}
      placeholder="ユーザ名"
      autoComplete="email"/>
      <InputText type="password" value={password} onChange={passwordHandler}
      placeholder="パスワード"
      autoComplete="password"/>
    </AuthForm>
  );
}

export function CheckEmailForm({ email, error, isFormValid, emailHandler, submit }: ReturnType<typeof useCheckEmail>) {
  return (
    <>
    <AuthForm title="メールアドレスで新規登録" submit={submit} error={error} buttonTxt="確認用メールを送信" isFormValid={isFormValid}>
      <InputText type="email" value={email} onChange={emailHandler}
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