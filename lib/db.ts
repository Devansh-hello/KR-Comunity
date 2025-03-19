import { PrismaClient } from '@prisma/client'

// Check if we're in production mode
const globalForPrisma = global as unknown as { db: PrismaClient }

// Export a cached or new PrismaClient instance
export const db = globalForPrisma.db || new PrismaClient()

// Only cache in production
if (process.env.NODE_ENV !== 'production') globalForPrisma.db = db 