import { client } from "./client";

export async function login(
  email: string,
  password: string,
) {
  const { data, error } = await client.POST("/api/login", {
    body: {
      email,
      password,
    },
  });

  if (error) {
    throw new Error("ログインに失敗しました");
  }

  return data;
}

export async function logout() {
  const { error } = await client.POST("/api/logout", {});

  if (error) {
    throw new Error("ログアウトに失敗しました");
  }
}

export async function getCurrentUser() {
  const { data, error } = await client.GET("/api/users/me", {});

  if (error) {
    return null;
  }

  return data;
}
