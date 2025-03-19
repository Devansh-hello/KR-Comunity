import { PrismaClient } from '@prisma/client'

// Check if we're in production mode
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Export a cached or new PrismaClient instance
export const prisma = globalForPrisma.prisma || new PrismaClient()

// Only cache in production
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 