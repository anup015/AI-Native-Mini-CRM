import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Xeno CRM"
      title="Create your workspace and start selling smarter"
      description="Build a secure CRM account with hashed passwords, protected routes, and a demo-ready onboarding flow."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link className="font-semibold text-primary hover:underline" href="/login">Sign in</Link>
        </p>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
