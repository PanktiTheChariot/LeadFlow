import { Spinner } from "@/components/common";

// proxy.ts always redirects "/" to /dashboard or /login before this renders;
// this only covers the split second before that redirect completes.
export default function RootPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-paper">
      <Spinner size={28} />
    </div>
  );
}
