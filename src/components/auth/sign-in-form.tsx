"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Loading02Icon } from "@hugeicons/core-free-icons";
import { useActionState } from "react";
import { signInAction } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/auth/form-field";
import { AuthFormDivider } from "@/components/auth/auth-form-divider";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInAction, {
    error: null,
  });

  return (
    <div className="w-full">
      <Card className="w-full max-w-md mx-auto">
        <form action={formAction}>
          <CardHeader className="space-y-1 pb-3 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Sign in</CardTitle>
            <CardDescription>Enter your email and password to access your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Email" htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={isPending}
              />
            </FormField>
            <FormField label="Password" htmlFor="password">
              <PasswordInput
                id="password"
                name="password"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={isPending}
              />
            </FormField>
            {state?.error && (
              <p className="text-sm text-destructive font-medium">{state.error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <HugeiconsIcon icon={Loading02Icon} className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col space-y-4">
          <AuthFormDivider />
          <GoogleSignInButton disabled={isPending} />
        </CardFooter>
      </Card>
    </div>
  );
}
