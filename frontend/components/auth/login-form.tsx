"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LoaderCircle, WandSparkles } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const nextPath = searchParams.get("next") ?? "/dashboard";

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const submitLabel = useMemo(() => (isSubmitting ? "Signing in..." : "Sign in"), [isSubmitting]);

  async function onSubmit(values: LoginValues) {
    setServerError(null);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl: nextPath
    });

    if (!result?.ok) {
      setServerError("Invalid email or password.");
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  async function handleDemoLogin() {
    setServerError(null);
    setDemoLoading(true);

    try {
      const response = await fetch("/api/auth/demo", { method: "POST" });
      if (!response.ok) {
        throw new Error("Unable to prepare demo access");
      }

      const demo = (await response.json()) as { email: string; password: string };
      const result = await signIn("credentials", {
        email: demo.email,
        password: demo.password,
        redirect: false,
        callbackUrl: nextPath
      });

      if (!result?.ok) {
        throw new Error("Demo login failed");
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setServerError("Demo login could not be prepared right now.");
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <Card className="border-white/15 bg-white/75 shadow-2xl dark:bg-slate-950/70">
      <CardHeader className="space-y-3 pb-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
          <WandSparkles className="h-3.5 w-3.5" />
          JWT Session Access
        </div>
        <CardTitle className="text-2xl font-extrabold tracking-tight">Welcome back</CardTitle>
        <p className="text-sm text-muted-foreground">Sign in to your CRM workspace and continue the pipeline.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <AuthField
            id="email"
            label="Email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <AuthField
            id="password"
            label="Password"
            type="password"
            placeholder="Your password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          {serverError ? <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">{serverError}</p> : null}

          <Button type="submit" className="w-full gap-2" disabled={isSubmitting || demoLoading}>
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {submitLabel}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button type="button" variant="secondary" className="w-full gap-2" onClick={handleDemoLogin} disabled={isSubmitting || demoLoading}>
          {demoLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Demo login
          {!demoLoading ? <ArrowRight className="h-4 w-4" /> : null}
        </Button>
      </CardContent>
    </Card>
  );
}
