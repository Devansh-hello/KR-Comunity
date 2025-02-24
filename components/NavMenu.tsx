"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function NavMenu() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="font-bold text-xl gradient-text">
          KRcommunity
        </Link>

        <div className="flex items-center space-x-1 ml-6">
          <Link 
            href="/posts"
            className={`nav-link ${pathname === "/posts" ? "bg-accent/20 text-accent" : "text-muted-foreground"}`}
          >
            Posts
          </Link>
          <Link 
            href="/events"
            className={`nav-link ${pathname === "/events" ? "bg-accent/20 text-accent" : "text-muted-foreground"}`}
          >
            Events
          </Link>
          <Link 
            href="/groups"
            className={`nav-link ${pathname === "/groups" ? "bg-accent/20 text-accent" : "text-muted-foreground"}`}
          >
            Groups
          </Link>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          
          {status === "loading" ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : session ? (
            <>
              <Button asChild variant="gradient" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Link href="/posts/create">Create Post</Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="hover:opacity-80 transition-opacity">
                  <Avatar className="ring-2 ring-accent/20">
                    <AvatarImage src={session.user?.image || ""} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      {session.user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild variant="gradient" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Link href="/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
} 