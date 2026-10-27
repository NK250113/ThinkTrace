import { useRouter, usePathname, useSearchParams } from "next/navigation";

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

export async function returnToPath() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // FastAPIの認証APIが成功した後
  const returnTo = searchParams.get("returnTo");

  const safePath =
    returnTo?.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : "/think";

  router.replace(safePath);
}