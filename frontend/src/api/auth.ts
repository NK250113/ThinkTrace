import { client } from "./client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
    throw new Error("ログインに失敗しました");
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
    return error.message;
  }

  return data;
}

export async function useRequireAuth(isAuthenticated: boolean | null) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 認証
  if (isAuthenticated === false) {
    const query = searchParams.toString();
    const returnTo = query ? `${pathname}?${query}` : pathname;

    router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }
}