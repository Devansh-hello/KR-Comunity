import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const pathname = req.nextUrl.pathname

      // Protect admin routes
      if (pathname.startsWith('/admin')) {
        return token?.role === "ADMIN"
      }

      // Check event creation permission
      if (pathname.startsWith('/events/create')) {
        return token?.role === "ADMIN" || 
               (token?.permissions as string[])?.includes("CREATE_EVENT")
      }

      // Check post deletion permission
      if (pathname.includes('/delete')) {
        return token?.role === "ADMIN" || 
               (token?.permissions as string[])?.includes("DELETE_POST")
      }

      // Allow other routes
      return true
    },
  },
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/events/create',
    '/posts/:path*/delete',
    '/dashboard/:path*'
  ],
} 