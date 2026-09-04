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