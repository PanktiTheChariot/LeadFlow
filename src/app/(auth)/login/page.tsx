import Link from "next/link";
import { Card, BrandMark } from "@/components/common";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex items-center gap-3 md:hidden">
        <BrandMark size={32} />
        <span className="font-brand text-3xl tracking-tight text-ink">LeadFlow</span>
      </div>
      <Card className="p-8">
        <h1 className="font-heading text-2xl text-ink">Welcome back</h1>
        <p className="mt-1 mb-6 text-sm text-ink-soft">Sign in to your workspace.</p>
        <LoginForm oauthError={error} />
        <p className="mt-6 text-center text-sm text-ink-soft">
          Don&rsquo;t have an account?{" "}
          <Link href="/signup" className="font-medium text-accent hover:underline">
            Create your company
          </Link>
        </p>
      </Card>
    </div>
  );
}
