import { client } from "@/src/api/client";

type loginCredentials = {
    email: string;
    password: string;
};
export async function login({ email, password }: loginCredentials) {
    const { data, error } = await client.POST("/api/login", {
        body: {
            email,
            password,
        },
    });
    if (error) {
        throw new Error("メールアドレスまたはパスワードが正しくありません");
    }
    return data;
};

type signupCredentials = {
    email: string;
    password: string;
    username: string;
};

export async function signup({ email, password, username }: signupCredentials) {
    const { data, error } = await client.POST("/api/signup/confirm", {
        body: {
            email,
            password,
            name: username,
        },
    });
    if (error) {
        throw new Error("サインアップに失敗しました");
    }
    return data;
};

type checkEmailCredentials = {
    email: string;
};
export async function checkEmail({ email }: checkEmailCredentials) {
    const { data, error } = await client.POST("/api/signup/send", {
        body: {
            email,
        },
    });
    if (error) {
        throw new Error("メールアドレスの送信に失敗しました");
    }
    return data;
};