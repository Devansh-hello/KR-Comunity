"use client"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

export function NavMenu() {
  const { data: session } = useSession()

  return (
    <div className="flex items-center gap-4">
      {session?.user && (
        <Button asChild variant="ghost">
          <Link href="/posts/create">Create Post</Link>
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {session?.user ? (
            <>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              {session.user.role === "ADMIN" && (
                <DropdownMenuItem asChild>
                  <Link href="/admin">Admin Panel</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/api/auth/signout">Sign Out</Link>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link href="/signin">Sign In</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/signup">Sign Up</Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 