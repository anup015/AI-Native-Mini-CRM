"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const signupSchema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password")
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  async function onSubmit(values: SignupValues) {
    setLoading(true);
    setServerError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password
        })
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Signup failed");
      }

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: "/dashboard"
      });

      if (!result?.ok) {
        router.push("/login?created=1");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-white/15 bg-white/75 shadow-2xl dark:bg-slate-950/70">
      <CardHeader className="space-y-3 pb-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          New workspace
        </div>
        <CardTitle className="text-2xl font-extrabold tracking-tight">Create your account</CardTitle>
        <p className="text-sm text-muted-foreground">Set up your CRM workspace with secure password auth.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <AuthField
            id="name"
            label="Full name"
            placeholder="Avery Chen"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />
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
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <AuthField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {serverError ? <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">{serverError}</p> : null}

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Create account
            {!loading ? <ArrowRight className="h-4 w-4" /> : null}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
