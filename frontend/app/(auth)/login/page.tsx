import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Xeno CRM"
      title="A polished sign-in experience for a modern CRM"
      description="Secure JWT sessions, smooth loading states, and a clean split-screen layout inspired by Linear and Vercel."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          New here? <Link className="font-semibold text-primary hover:underline" href="/signup">Create an account</Link>
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
