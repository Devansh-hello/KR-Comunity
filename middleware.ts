import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const pathname = req.nextUrl.pathname

      // Protect create routes
      if (
        pathname.startsWith('/groups/create') ||
        pathname.startsWith('/lost-found/create') ||
        pathname.startsWith('/events/create')
      ) {
        return !!token
      }

      // Allow other routes
      return true
    },
  },
})

export const config = {
  matcher: [
    '/groups/create',
    '/lost-found/create',
    '/events/create',
    '/profile',
  ],
} 