"use client"

import { useState, useEffect } from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LoadingLink } from "@/components/ui/loading-link"
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import type { TeamMember } from "@/types";
import { useRouter } from "next/navigation";
import { Skeleton } from "./ui/skeleton"
import { useLoading } from "@/contexts/loading-context"

export function UserNav() {
    const [user, setUser] = useState<TeamMember | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { showLoader } = useLoading();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
            if (authUser?.email) {
                const teamRef = collection(db, "teamMembers");
                const q = query(teamRef, where("email", "==", authUser.email));
                const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
                    if (!querySnapshot.empty) {
                        setUser({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as TeamMember);
                    }
                    setLoading(false);
                });
                return () => unsubscribeSnapshot();
            } else {
                setLoading(false);
                setUser(null);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    const handleLogout = async () => {
        showLoader();
        await signOut(auth);
        router.push('/login');
    };

    if (loading) {
        return <Skeleton className="h-8 w-8 rounded-full" />
    }

    if (!user) {
        return (
            <Button asChild variant="outline">
                <LoadingLink href="/login">Login</LoadingLink>
            </Button>
        )
    }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait" />
            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
             <LoadingLink href="/dashboard/settings" className="w-full cursor-pointer">
              Profile
            </LoadingLink>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
             <LoadingLink href="/dashboard/settings" className="w-full cursor-pointer">
                Settings
            </LoadingLink>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <LoadingLink href="/dashboard/team" className="w-full cursor-pointer">
              Team
            </LoadingLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            Log out
          <DropdownMenuShortcut>⇧Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
