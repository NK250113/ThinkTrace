import { client } from "./client";

export async function login(
  email: string,
  password: string,
) {
  const { data, error } = await client.POST("/api/auth/login", {
    body: {
      email,
      password,
    },
  });

  if (error) {
    throw new Error(error.content.message);
  }

  return data;
}

export async function logout() {
  const { error } = await client.POST("/api/auth/logout", {});

  if (error) {
    throw new Error("ログアウトに失敗しました");
  }
}

export async function getCurrentUser() {
  const { data, error } = await client.GET("/api/auth/me", {});

  if (error) {
    throw new Error(error.content.message);
  }

  return data;
}