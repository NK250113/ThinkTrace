import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

export function useRequireAuth(isAuthenticated: boolean | null) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 認証状態の確認中は何もしない
    if (isAuthenticated === null) return;

    if (!isAuthenticated) {
      const query = searchParams.toString();
      const returnTo = query ? `${pathname}?${query}` : pathname;

      router.replace(
        `/login?returnTo=${encodeURIComponent(returnTo)}`
      );
    }
  }, [isAuthenticated, pathname, searchParams, router]);
}

export function useReturnToPath() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const returnToPath = useCallback(() => {
    const returnTo = searchParams.get("returnTo");

    const safePath =
      returnTo?.startsWith("/") && !returnTo.startsWith("//")
        ? returnTo
        : "/think";

    router.replace(safePath);
  }, [searchParams, router]);

  return returnToPath;
}