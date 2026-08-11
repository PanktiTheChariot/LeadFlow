import Link from "next/link";
import { Card, BrandMark } from "@/components/common";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex items-center gap-3 md:hidden">
        <BrandMark size={32} />
        <span className="font-brand text-3xl tracking-tight text-ink">LeadFlow</span>
      </div>
      <Card className="p-8">
        <h1 className="font-heading text-2xl text-ink">Create your company</h1>
        <p className="mt-1 mb-6 text-sm text-ink-soft">
          Creates a new, fully isolated workspace with you as its admin.
        </p>
        <SignupForm />
        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
