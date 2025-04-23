# KR Community

A modern community platform built with Next.js, Prisma, and PostgreSQL. This application allows users to create and join groups, participate in real-time chats, share posts, and organize events.

## Features

### User Management
- Authentication with NextAuth.js (Google, GitHub, and credentials)
- User profiles with customizable settings
- Role-based access control (Admin, Moderator, User)

### Groups and Communities
- Create and join public/private groups
- Real-time chat within groups using Server-Sent Events (SSE)
- Multiple channels per group (Text, Voice, Announcement)
- Emoji reactions to messages
- File attachments and image sharing

### Content Sharing
- Create and view posts
- Upvote/downvote system
- Comments on posts
- Moderation tools for community managers

### Events
- Create and manage events
- RSVP functionality
- Event groups with dedicated chat

### Additional Features
- Lost & Found board
- Responsive design for mobile and desktop
- Modern UI with dark/light mode support

## Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database

### Setup
1. Clone the repository
```bash
git clone https://github.com/your-username/kr-community.git
cd kr-community
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="postgresql://username:password@localhost:5432/kr_community"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
NEXT_PUBLIC_GIPHY_API_KEY="your-giphy-api-key" # Optional, for GIF support
```

4. Set up the database
```bash
npx prisma db push
```

5. Start the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating a Group
1. Sign in to your account
2. Navigate to the Groups page
3. Click "Create Group"
4. Fill in the group details (name, description, privacy settings)
5. Upload an optional group image
6. Click "Create" to finish

### Joining a Chat
1. Navigate to the Groups page
2. Click on a group you're a member of
3. Select a channel from the sidebar
4. Start chatting with real-time updates

### Creating a Post
1. Navigate to the Posts page
2. Click "Create Post"
3. Select a community (optional)
4. Add a title, content, and optional image
5. Click "Publish" to share your post

## Technology Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API routes
- **Database**: PostgreSQL, Prisma ORM
- **Authentication**: NextAuth.js
- **Real-time Communication**: Server-Sent Events (SSE)
- **Deployment**: Vercel (recommended)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 