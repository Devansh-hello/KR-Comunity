# KRCommunity Platform Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Frontend](#frontend)
   - [Technologies Used](#frontend-technologies)
   - [Folder Structure](#frontend-folder-structure)
   - [Components](#components)
   - [Pages and Routing](#pages-and-routing)
   - [State Management](#state-management)
   - [Authentication UI](#authentication-ui)
   - [Styling System](#styling-system)
4. [Backend](#backend)
   - [Technologies Used](#backend-technologies)
   - [API Routes](#api-routes)
   - [Middleware](#middleware)
   - [Authentication](#authentication)
   - [File Uploads](#file-uploads)
5. [Database](#database)
   - [Schema Design](#schema-design)
   - [Models](#models)
   - [Relations](#relations)
   - [Prisma Integration](#prisma-integration)
6. [Features](#features)
   - [Authentication System](#authentication-system)
   - [Posts](#posts)
   - [Events](#events)
   - [Groups](#groups)
   - [Lost & Found](#lost--found)
   - [Communities](#communities)
   - [Admin Panel](#admin-panel)
7. [Implementation Details](#implementation-details)
8. [Deployment](#deployment)
9. [Future Improvements](#future-improvements)

## Introduction

KRCommunity is a comprehensive community platform built with modern web technologies. It enables users to share posts, organize events, form groups, and help each other with lost and found items. The platform includes a powerful admin panel for site management and moderation.

This documentation provides a detailed breakdown of how the platform works, the technologies used, and implementation details to help you understand, modify, and extend it.

## Architecture Overview

The platform follows a modern full-stack JavaScript architecture:

- **Frontend**: Next.js with React, TypeScript, and Tailwind CSS
- **Backend**: Next.js API routes with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js for multi-provider authentication
- **Styling**: Tailwind CSS with shadcn/ui components
- **File Storage**: UploadThing for image uploads
- **State Management**: React hooks and Context API

The architecture is structured around the App Router pattern in Next.js, providing a clean separation of concerns while leveraging the benefits of server components and client components where appropriate.

## Frontend

### Frontend Technologies

1. **Next.js**: Used as the React framework for both server and client components, enabling server-side rendering, API routes, and optimized page routing.
   - Why: Provides excellent developer experience, built-in performance optimizations, and flexibility for both server and client rendering.

2. **TypeScript**: Used throughout the codebase for type safety and better developer experience.
   - Why: Helps catch errors at compile time, provides better code documentation, and improves code quality.

3. **Tailwind CSS**: Used for styling the application with utility classes.
   - Why: Enables rapid UI development, consistent design tokens, and excellent responsive capabilities.

4. **shadcn/ui**: Used for UI components, built on top of Radix UI.
   - Why: Provides accessible, customizable, and well-designed components that integrate seamlessly with Tailwind CSS.

5. **Framer Motion**: Used for animations throughout the interface.
   - Why: Enables smooth, performant animations with an intuitive API.

6. **date-fns**: Used for date formatting and manipulation.
   - Why: Lightweight and tree-shakable library for handling dates.

7. **React Hook Form**: Used for form validation and submission.
   - Why: Provides excellent performance and developer experience for handling forms.

8. **Zod**: Used for schema validation.
   - Why: Type-safe validation that integrates well with TypeScript.

### Frontend Folder Structure

```
/app                # Next.js App Router pages
  /api              # API routes
  /auth             # Authentication pages
  /dashboard        # User dashboard pages
  /posts            # Post-related pages
  /events           # Event-related pages
  /groups           # Group-related pages
  /lost-found       # Lost & Found pages
  /admin            # Admin pages
  /globals.css      # Global styles
  /layout.tsx       # Root layout
  /page.tsx         # Home page

/components         # Reusable React components
  /ui               # UI components
  /home             # Home page components
  /dashboard        # Dashboard-specific components
  /events           # Event-related components
  /admin            # Admin-specific components

/lib                # Utility functions and modules
  /auth.ts          # Authentication configuration
  /db.ts            # Database utilities
  /prisma.ts        # Prisma client
  /utils.ts         # General utilities
  /moderation.ts    # Content moderation utilities
  /hooks.ts         # Custom React hooks
  /socket.ts        # Socket.io configuration

/hooks              # Custom React hooks

/prisma             # Prisma ORM configuration
  /schema.prisma    # Database schema

/public             # Static assets
```

### Components

The components are organized into several categories:

1. **UI Components**: Basic building blocks like buttons, cards, inputs, etc.
   ```tsx
   // Example Button component from shadcn/ui
   import { Button } from "@/components/ui/button"
   
   <Button variant="default" size="default">
     Click me
   </Button>
   ```

2. **Layout Components**: Define the structure of the application, such as headers, footers, and navigation.
   ```tsx
   // NavMenu component for navigation
   export function NavMenu() {
     return (
       <div className="flex items-center justify-between w-full">
         {/* Logo and navigation links */}
       </div>
     )
   }
   ```

3. **Feature Components**: Specific to certain features, like posts, events, etc.
   ```tsx
   // EventRegistration component
   export function EventRegistration({ eventId }: { eventId: string }) {
     const [loading, setLoading] = useState(false)
     // Registration form and logic
     return (
       <form onSubmit={handleSubmit}>
         {/* Form fields */}
       </form>
     )
   }
   ```

4. **Page Components**: Make up the pages of the application, importing and composing other components.

### Pages and Routing

Next.js App Router is used for routing, with pages organized in the `/app` directory:

- `/app/page.tsx`: Home page
- `/app/posts/page.tsx`: Posts listing
- `/app/posts/[postId]/page.tsx`: Individual post page
- `/app/events/page.tsx`: Events listing
- `/app/dashboard/page.tsx`: User dashboard
- `/app/admin/page.tsx`: Admin dashboard

The routing uses dynamic segments (like `[postId]`) to handle parameterized routes.

### State Management

State management is done through a combination of:

1. **Local Component State**: For UI state that doesn't need to be shared.
   ```tsx
   const [loading, setLoading] = useState(false)
   ```

2. **Context API**: For sharing state across components without prop drilling.
   ```tsx
   // Example: Theme provider
   export function Providers({ children }: { children: React.ReactNode }) {
     return (
       <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
         <SessionProvider>{children}</SessionProvider>
       </ThemeProvider>
     )
   }
   ```

3. **SWR**: For data fetching and caching.
   ```tsx
   // Example of data fetching with React hooks
   useEffect(() => {
     fetchPosts(activeTab)
   }, [activeTab])
   
   const fetchPosts = async (sort: string) => {
     try {
       const response = await fetch(`/api/posts?sort=${sort}`)
       const data = await response.json()
       setPosts(data)
       setLoading(false)
     } catch (error) {
       console.error("Error fetching posts:", error)
       setLoading(false)
     }
   }
   ```

### Authentication UI

Authentication UI components handle user sign-in, sign-up, and account management:

- Sign-in page with multiple authentication providers
- Profile settings in the dashboard
- Protected routes that redirect to sign-in when needed

```tsx
// Example sign-in component
export default function SignInPage() {
  const router = useRouter()
  // Form state and handlers
  
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      await signIn(provider, {
        callbackUrl: '/',
      })
    } catch (error) {
      setError("Failed to sign in with " + provider)
    }
  }
  
  return (
    <div className="container">
      <Card>
        {/* Authentication form */}
      </Card>
    </div>
  )
}
```

### Styling System

The styling system uses Tailwind CSS with a customized configuration:

1. **Utility Classes**: For rapid styling and consistency.
   ```jsx
   <div className="flex items-center justify-between p-4 bg-background">
     {/* Content */}
   </div>
   ```

2. **Custom Theme**: Extended Tailwind configuration with custom colors, spacing, etc.
   ```javascript
   // tailwind.config.js
   module.exports = {
     theme: {
       extend: {
         colors: {
           // Custom colors
         },
       },
     },
     plugins: [
       // Plugins
     ],
   }
   ```

3. **Component Variants**: Using `class-variance-authority` for component variants.

4. **Dark Mode**: Using `next-themes` for theme switching.
   ```tsx
   // ModeToggle component
   export function ModeToggle() {
     const { theme, setTheme } = useTheme()
     
     return (
       <DropdownMenu>
         {/* Theme options */}
       </DropdownMenu>
     )
   }
   ```

## Backend

### Backend Technologies

1. **Next.js API Routes**: Used for the backend API endpoints.
   - Why: Provides a serverless architecture, easy deployment, and tight integration with the frontend.

2. **Prisma**: Used as the ORM for database access.
   - Why: Type-safe database access, schema migrations, and excellent developer experience.

3. **NextAuth.js**: Used for authentication and session management.
   - Why: Simplifies authentication with multiple providers and handles JWT tokens for you.

4. **bcryptjs**: Used for password hashing.
   - Why: Secure password storage with salting and hashing.

5. **Socket.IO**: Used for real-time features.
   - Why: Enables real-time communication between clients and server.

### API Routes

API routes are organized by feature in the `/app/api` directory:

- `/app/api/auth`: Authentication-related endpoints
- `/app/api/posts`: Post management endpoints
- `/app/api/events`: Event management endpoints
- `/app/api/groups`: Group management endpoints
- `/app/api/lost-found`: Lost & Found endpoints
- `/app/api/admin`: Admin-specific endpoints
- `/app/api/upload`: File upload endpoints

Example API route implementation:

```typescript
// app/api/posts/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sort = searchParams.get('sort') || 'latest'
  
  try {
    let posts
    
    if (sort === 'latest') {
      posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { name: true, image: true } },
          community: { select: { name: true } },
          _count: { select: { votes: true, comments: true } }
        },
        take: 10
      })
    } else if (sort === 'top') {
      posts = await prisma.post.findMany({
        orderBy: { upvotes: 'desc' },
        include: {
          author: { select: { name: true, image: true } },
          community: { select: { name: true } },
          _count: { select: { votes: true, comments: true } }
        },
        take: 10
      })
    }
    
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { title, content, image, communityId } = body
    
    const post = await prisma.post.create({
      data: {
        title,
        content,
        image,
        communityId,
        authorId: session.user.id
      }
    })
    
    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
```

### Middleware

Middleware is used for route protection and authentication checks:

```typescript
// middleware.ts
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
```

### Authentication

Authentication is implemented using NextAuth.js:

```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate credentials
      }
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session, token }) {
      // Customize session
      return session
    },
    async jwt({ token, user, account }) {
      // Customize JWT
      return token
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
```

### File Uploads

File uploads are handled using UploadThing:

```typescript
// components/ImageUpload.tsx
export function ImageUpload({ onChange, value }: ImageUploadProps) {
  return (
    <div className="space-y-4">
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          onChange(res[0].url)
        }}
        onUploadError={(error: Error) => {
          console.error(error)
        }}
      />
      {value && (
        <div className="relative aspect-video">
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-cover rounded-md"
          />
        </div>
      )}
    </div>
  )
}
```

## Database

### Schema Design

The database schema is designed to handle the platform's features efficiently:

- **User**: Central entity for authentication and permissions
- **Post**: User-generated content with voting and commenting
- **Event**: Community events with registration
- **Group**: User groups for collaboration
- **Community**: Content categorization
- **LostFoundItem**: Lost and found items

### Models

The main models are defined in the Prisma schema:

```prisma
// prisma/schema.prisma
model User {
  id               String             @id @default(cuid())
  username         String?            @unique
  name             String?
  email            String?            @unique
  emailVerified    DateTime?
  image            String?
  role             UserRole           @default(USER)
  hashedPassword   String?
  posts            Post[]
  events           Event[]            @relation("EventAuthor")
  registrations    Registration[]
  // Other relations
}

model Post {
  id          String     @id @default(cuid())
  title       String
  content     String     @db.Text
  image       String?
  upvotes     Int        @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  authorId    String
  author      User       @relation(fields: [authorId], references: [id], onDelete: Cascade)
  communityId String?
  community   Community? @relation(fields: [communityId], references: [id])
  votes       Vote[]
  comments    Comment[]
  reported    Boolean    @default(false)
  moderated   Boolean    @default(false)
}

model Event {
  id            String         @id @default(cuid())
  title         String
  content       String
  category      String
  capacity      Int
  registered    Int            @default(0)
  deadline      DateTime
  location      String
  image         String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  author        User           @relation("EventAuthor", fields: [authorId], references: [id])
  authorId      String
  registrations Registration[]
  group         EventGroup?
}

// Other models
```

### Relations

The database schema includes various relations between models:

1. **One-to-Many**: For example, a User has many Posts or Events.
   ```prisma
   model User {
     id    String @id
     posts Post[]
   }
   
   model Post {
     id       String @id
     authorId String
     author   User   @relation(fields: [authorId], references: [id])
   }
   ```

2. **Many-to-Many**: For example, Users and Groups.
   ```prisma
   model User {
     id               String       @id
     groupMemberships GroupMember[]
   }
   
   model Group {
     id      String       @id
     members GroupMember[]
   }
   
   model GroupMember {
     id       String @id
     groupId  String
     userId   String
     group    Group  @relation(fields: [groupId], references: [id])
     user     User   @relation(fields: [userId], references: [id])
     @@unique([groupId, userId])
   }
   ```

3. **One-to-One**: For example, an Event has one EventGroup.
   ```prisma
   model Event {
     id     String     @id
     group  EventGroup?
   }
   
   model EventGroup {
     id      String @id
     event   Event  @relation(fields: [eventId], references: [id])
     eventId String @unique
   }
   ```

### Prisma Integration

Prisma is used for database operations:

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma
```

Using Prisma in API routes:

```typescript
// Example API route using Prisma
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, image: true } },
      }
    })
    
    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}
```

## Features

### Authentication System

The authentication system supports multiple providers:

- Email/password authentication
- Google authentication
- GitHub authentication

Features:
- User registration and login
- Password hashing with bcrypt
- JWT-based sessions
- User roles (USER, ADMIN, MODERATOR)
- Permission-based access control

### Posts

The post system includes:

- Post creation with rich text and images
- Upvoting/downvoting posts
- Commenting on posts
- Sorting posts by latest, top, etc.
- Categorizing posts by community

Implementation:
- Rich text editing
- Image uploads with UploadThing
- Real-time updates for votes and comments
- Post moderation for admins

### Events

The event system includes:

- Event creation with details (title, description, date, location, etc.)
- Event registration and attendance tracking
- Event groups for discussion
- QR code check-in system
- Event capacity management

Implementation:
- Calendar integration
- QR code generation and scanning
- Attendance tracking
- Real-time registration updates

### Groups

The group system includes:

- Group creation and management
- Group membership with roles
- Group discussions
- Private and public groups

Implementation:
- Permissions-based access control
- Member management
- Content moderation within groups

### Lost & Found

The lost and found system includes:

- Reporting lost items
- Posting found items
- Status tracking (open, closed, resolved)
- Location information
- Image uploads

Implementation:
- Status management
- Image uploads
- Contact integration

### Communities

The community system includes:

- Community creation and management
- Community membership
- Community-specific posts
- Community moderation

Implementation:
- Permission-based moderation
- Content categorization
- Community discovery

### Admin Panel

The admin panel includes:

- User management
- Content moderation
- Event management
- Statistics and reporting

Implementation:
- Role-based access control
- Batch operations
- Analytics and reporting
- System settings

## Implementation Details

### Role-based Access Control

The platform implements role-based access control (RBAC):

1. **User Roles**:
   - USER: Standard user privileges
   - ADMIN: Full system access
   - MODERATOR: Content moderation privileges

2. **Permission Checks**:
   - Middleware checks for route access
   - API-level permission validation
   - UI conditional rendering based on permissions

```typescript
// Middleware permission checks
if (pathname.startsWith('/admin')) {
  return token?.role === "ADMIN"
}
```

### Real-time Features

Real-time features are implemented using Socket.IO:

1. **Event Chat**: Real-time messaging for event participants
2. **Notifications**: Real-time notifications for actions
3. **Live Updates**: Updates for content changes

```typescript
// lib/socket.ts
import { Server } from "socket.io"

let io: Server | null = null

export function getSocketIO() {
  return io
}

export function initSocketIO(server: any) {
  io = new Server(server, {
    // Socket.IO options
  })
  
  io.on("connection", (socket) => {
    // Handle socket connections
  })
  
  return io
}
```

### Image Uploads

Image uploads are handled through the UploadThing integration:

1. **Client-side**: UploadThing React components for file selection and upload
2. **Server-side**: UploadThing API handlers for file storage
3. **Database**: Image URLs stored in the database

### Form Validation

Form validation is implemented using a combination of React Hook Form and Zod:

1. **Zod Schemas**: Define validation rules
2. **React Hook Form**: Handle form state and validation
3. **Error Messages**: Display validation errors to users

```typescript
// Example form validation
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(10),
})

function PostForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  })
  
  // Form handling
}
```

## Deployment

The platform can be deployed to various environments:

### Vercel (Recommended)

1. **Setup**:
   - Connect your GitHub repository
   - Configure environment variables
   - Deploy with a single click

2. **Benefits**:
   - Tight integration with Next.js
   - Automatic deployments on push
   - Preview deployments for pull requests
   - Edge functions for API routes

### Database Deployment

1. **PostgreSQL Options**:
   - Railway
   - Supabase
   - Neon
   - AWS RDS

2. **Migration Process**:
   - Run Prisma migrations during deployment
   - Set up database connection strings in environment variables

## Future Improvements

### Features

1. **Real-time Notifications**:
   - Push notifications
   - In-app notification center
   - Email notifications

2. **Direct Messaging**:
   - Private conversations between users
   - Group messaging
   - Message read status

3. **Rich Text Editor**:
   - Enhanced formatting options
   - Embeds for external content
   - Code blocks for technical communities

4. **User Profiles**:
   - Enhanced user profiles
   - Customization options
   - Activity history

5. **Search Functionality**:
   - Full-text search across content
   - Advanced filters
   - Search suggestions

### Technical Improvements

1. **Server-side Caching**:
   - Redis integration
   - API response caching
   - Database query caching

2. **WebSocket Integration**:
   - More real-time features
   - Enhanced performance
   - Reconnection handling

3. **PWA Support**:
   - Offline capabilities
   - Install prompts
   - Background sync

4. **Analytics Integration**:
   - User behavior tracking
   - Conversion optimization
   - Performance monitoring 