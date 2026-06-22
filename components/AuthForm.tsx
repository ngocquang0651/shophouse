"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2, LockKeyhole, Mail } from "lucide-react";
import { login } from "@/lib/auth";
import { cn } from "@/lib/utils";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormErrors = {
  email?: string;
  password?: string;
  form?: string;
};

export function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FormErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (!result.ok) {
      setErrors({ form: result.message });
      return;
    }

    router.replace(result.user.role === "admin" ? "/admin/products" : "/");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {errors.form ? (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {errors.form}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-800" htmlFor="email">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
          <input
            className={cn(
              "h-12 w-full border bg-white pl-10 pr-4 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10",
              errors.email ? "border-red-300" : "border-neutral-300 hover:border-neutral-500"
            )}
            id="email"
            type="email"
            autoComplete="email"
            placeholder="user@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
        </div>
        {errors.email ? (
          <p className="text-sm text-red-700" id="email-error">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-800" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
          <input
            className={cn(
              "h-12 w-full border bg-white pl-10 pr-12 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10",
              errors.password ? "border-red-300" : "border-neutral-300 hover:border-neutral-500"
            )}
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="password123"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          <button
            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-neutral-500 transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-ink/15"
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            disabled={isLoading}
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
          >
            <Eye className="size-4" />
          </button>
        </div>
        {errors.password ? (
          <p className="text-sm text-red-700" id="password-error">
            {errors.password}
          </p>
        ) : null}
      </div>

      <button
        className="flex h-12 w-full items-center justify-center gap-2 bg-ink px-5 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-ink/20 disabled:cursor-not-allowed disabled:bg-neutral-400"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
        Sign in
      </button>
    </form>
  );
}
