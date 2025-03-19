"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Menu, Home, FileText, Calendar, Users, LayoutDashboard, ShieldAlert, BellRing, Compass } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/ModeToggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Extended User type to include role
interface ExtendedUser {
  name?: string | null;
  email?: string | null; 
  image?: string | null;
  role?: string;
  id?: string;
}

// Extended Session type
interface ExtendedSession {
  user?: ExtendedUser;
  expires: string;
}

export function NavMenu() {
  const pathname = usePathname()
  const { data: session, status } = useSession() as { data: ExtendedSession | null, status: string }
  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <div className="flex items-center justify-between w-full">
      {/* Logo and Desktop Navigation */}
      <div className="flex items-center gap-6">
        <Link href="/" className="block">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
            KRcommunity
          </h1>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link 
            href="/posts"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/posts" || pathname.startsWith("/posts/") ? "text-primary" : "text-muted-foreground"
            )}
          >
            Posts
          </Link>
          <Link 
            href="/events"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/events" || pathname.startsWith("/events/") ? "text-primary" : "text-muted-foreground"
            )}
          >
            Events
          </Link>
          <Link 
            href="/groups"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/groups" || pathname.startsWith("/groups/") ? "text-primary" : "text-muted-foreground"
            )}
          >
            Groups
          </Link>
          <Link 
            href="/lost-found"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/lost-found" || pathname.startsWith("/lost-found/") ? "text-primary" : "text-muted-foreground"
            )}
          >
            Lost & Found
          </Link>
        </nav>
      </div>

      {/* Right Side: Mobile Menu, Theme Toggle, Auth */}
      <div className="flex items-center gap-2">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Menu</h2>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                <Link 
                  href="/"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted"
                >
                  <Home className="h-5 w-5" />
                  Home
                </Link>
                <Link 
                  href="/posts"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted"
                >
                  <FileText className="h-5 w-5" />
                  Posts
                </Link>
                <Link 
                  href="/events"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted"
                >
                  <Calendar className="h-5 w-5" />
                  Events
                </Link>
                <Link 
                  href="/groups"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted"
                >
                  <Users className="h-5 w-5" />
                  Groups
                </Link>
                <Link 
                  href="/lost-found"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted"
                >
                  <Compass className="h-5 w-5" />
                  Lost & Found
                </Link>
                {session && (
                  <Link 
                    href="/dashboard"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link 
                    href="/admin"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted"
                  >
                    <ShieldAlert className="h-5 w-5" />
                    Admin
                  </Link>
                )}
              </nav>
              {session && (
                <div className="p-4 border-t">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={session.user?.image || ""} />
                      <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{session.user?.name}</p>
                      <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4"
                    onClick={() => signOut()}
                  >
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <ModeToggle />
          {status === "loading" ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : session ? (
            <>
              <Button asChild variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <Link href="/posts/new">Create Post</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ""} />
                    <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              <Link href="/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 