import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { StoreHydrator } from "@/components/store-hydrator";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <>
      <StoreHydrator userId={session.user.id} />
      <DashboardShell
        user={{
          name: session.user.name ?? "",
          email: session.user.email ?? "",
          image: session.user.image,
        }}
      >
        {children}
      </DashboardShell>
    </>
  );
}
