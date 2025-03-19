import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create a sample user first
  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@example.com",
      username: "demo_user",
      role: "USER"
    }
  })

  console.log('Created demo user:', user.id)

  // Create sample events
  const events = [
    {
      title: "Community Meetup",
      content: "Join us for our monthly community meetup where we'll discuss upcoming projects and initiatives.",
      category: "CULTURAL",
      location: "Community Center",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      capacity: 50,
      image: "/sample-event-1.jpg"
    },
    {
      title: "Tech Workshop",
      content: "Learn about the latest technologies and how to implement them in your projects.",
      category: "TECHNICAL",
      location: "Tech Hub",
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      capacity: 30,
      image: "/sample-event-2.jpg"
    },
    {
      title: "Cultural Festival",
      content: "Celebrate diversity with music, food, and performances from different cultures.",
      category: "CULTURAL",
      location: "City Park",
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      capacity: 200,
      image: "/sample-event-3.jpg"
    }
  ]

  for (const event of events) {
    await prisma.event.create({
      data: {
        ...event,
        author: {
          connect: {
            id: user.id
          }
        }
      }
    })
  }

  console.log('Sample events have been created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 