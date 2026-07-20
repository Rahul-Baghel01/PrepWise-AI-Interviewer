import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import UserProfileMenu from "@/components/UserProfileMenu";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" aria-label="PrepWise dashboard">
          <Image src="/logo.svg" alt="" width={38} height={32} priority />
          <h2 className="text-primary-100">PrepWise</h2>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/resume" className="rounded-full border border-white/10 bg-dark-200/70 px-3 py-2 text-sm text-light-100 transition hover:border-primary-200/30 hover:text-white">
            Resume AI
          </Link>
          <UserProfileMenu user={user} />
        </div>
      </nav>

      {children}
    </div>
  );
};

export default Layout;
