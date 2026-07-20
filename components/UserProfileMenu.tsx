"use client";

import Image from "next/image";
import { LogOut, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut as firebaseSignOut } from "firebase/auth";
import { toast } from "sonner";

import { auth } from "@/firebase/client";
import { signOut as clearSession } from "@/lib/actions/auth.action";

export default function UserProfileMenu({ user }: { user: User }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await firebaseSignOut(auth);
    } catch {
      // The server session must still be cleared even if the browser auth state is stale.
    } finally {
      try {
        await clearSession();
        router.replace("/sign-in");
        router.refresh();
      } catch {
        setIsLoggingOut(false);
        toast.error("Unable to sign out. Please try again.");
      }
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-dark-200/70 p-1.5 pr-3 transition hover:border-primary-200/35 hover:bg-dark-300 focus:outline-none focus:ring-4 focus:ring-primary-200/15"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open account menu"
      >
        <Image src="/user-avatar.png" alt="" width={32} height={32} className="size-8 rounded-full object-cover" />
        <span className="hidden max-w-28 truncate text-sm font-medium text-primary-100 sm:block">{user.name}</span>
        {isOpen ? <X size={16} className="text-light-400" aria-hidden="true" /> : <Menu size={16} className="text-light-400" aria-hidden="true" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-white/10 bg-dark-300/95 p-2 shadow-2xl shadow-dark-100/50 backdrop-blur-xl" role="menu">
          <div className="flex items-center gap-3 rounded-xl px-3 py-3">
            <Image src="/user-avatar.png" alt="" width={44} height={44} className="size-11 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{user.name}</p>
              <p className="mt-0.5 truncate text-sm text-light-400">{user.email}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-white/10" />
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-destructive-100 transition hover:bg-destructive-100/10 focus:outline-none focus:ring-2 focus:ring-destructive-100/30 disabled:cursor-not-allowed disabled:opacity-70"
            role="menuitem"
          >
            <LogOut size={17} aria-hidden="true" />
            {isLoggingOut ? "Signing out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
