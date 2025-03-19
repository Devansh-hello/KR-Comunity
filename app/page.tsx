"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowRight, FileText, CalendarDays, Users, Compass, LayoutDashboard, ShieldAlert } from "lucide-react"
import { motion } from "framer-motion"
import { HeroCarousel } from "@/components/home/HeroCarousel"
import { FeaturedEvent } from "@/components/home/FeaturedEvent"
import { TopPosts } from "@/components/home/TopPosts"
import { LatestPosts } from "@/components/home/LatestPosts"
import { Communities } from "@/components/home/Communities"
import { UpcomingEvents } from "@/components/home/UpcomingEvents"

// Animation variants
const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
}

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

export default function HomePage() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null, status: string }
  const router = useRouter()
  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <div className="min-h-screen space-y-16 py-12">
      {/* Featured Event */}
      <section className="container px-0 sm:px-4">
        <FeaturedEvent />
      </section>

      {/* Quick Access Cards */}
      <section className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-8">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Posts Card */}
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Posts
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-muted-foreground">
                  Browse posts, create content, and engage with the community.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="group-hover:text-primary group-hover:bg-primary/10 transition-all w-full justify-between">
                  <Link href="/posts">
                    Browse Posts
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Events Card */}
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Events
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-muted-foreground">
                  Discover upcoming events, register, and participate.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="group-hover:text-primary group-hover:bg-primary/10 transition-all w-full justify-between">
                  <Link href="/events">
                    Browse Events
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Groups Card */}
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Groups
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-muted-foreground">
                  Join groups, collaborate with others and build community.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="group-hover:text-primary group-hover:bg-primary/10 transition-all w-full justify-between">
                  <Link href="/groups">
                    Browse Groups
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Lost & Found Card */}
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  Lost & Found
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-muted-foreground">
                  Report lost items or check for found items in the community.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="group-hover:text-primary group-hover:bg-primary/10 transition-all w-full justify-between">
                  <Link href="/lost-found">
                    Browse Items
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Posts Grid */}
      <section className="container">
        <motion.div
          className="grid md:grid-cols-2 gap-8"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <TopPosts />
          <LatestPosts />
        </motion.div>
      </section>

      {/* Communities */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            <Communities />
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="container pb-16">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <UpcomingEvents />
        </motion.div>
      </section>

      {/* User Dashboard & Admin Section (if authenticated) */}
      {session && (
        <section className="container pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-8">Your Account</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dashboard Card */}
              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    Your Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-muted-foreground">
                    Access your personal dashboard to manage posts, events, and account settings.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="ghost" className="group-hover:text-primary group-hover:bg-primary/10 transition-all w-full justify-between">
                    <Link href="/dashboard?tab=profile">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Admin Panel (if admin) */}
              {isAdmin && (
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-primary" />
                      Admin Dashboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-muted-foreground">
                      Access administrative controls to manage users, content and site settings.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="ghost" className="group-hover:text-primary group-hover:bg-primary/10 transition-all w-full justify-between">
                      <Link href="/admin">
                        Go to Admin Panel
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </motion.div>
        </section>
      )}
    </div>
  )
}

