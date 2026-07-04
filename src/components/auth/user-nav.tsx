"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface UserNavProps {
  name: string;
  email: string;
}

export function UserNav({ name, email }: UserNavProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm">
        <HugeiconsIcon icon={UserIcon} className="h-4 w-4 text-muted-foreground" />
        <span className="hidden sm:inline text-muted-foreground">{name || email}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => signOut({ redirectTo: "/" }).catch(() => {})}
      >
        <HugeiconsIcon icon={Logout01Icon} className="h-4 w-4" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </div>
  );
}
