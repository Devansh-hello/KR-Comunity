const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    // Find the demo user
    const demoUser = await prisma.user.findUnique({
      where: {
        email: "demo@example.com"
      }
    })

    if (demoUser) {
      // First delete all events created by this user
      const deletedEvents = await prisma.event.deleteMany({
        where: {
          authorId: demoUser.id
        }
      })
      
      console.log(`Deleted ${deletedEvents.count} demo events`)

      // Delete the registrations associated with the user
      const deletedRegistrations = await prisma.registration.deleteMany({
        where: {
          userId: demoUser.id
        }
      })
      
      console.log(`Deleted ${deletedRegistrations.count} event registrations`)
      
      // Delete the demo user
      await prisma.user.delete({
        where: {
          id: demoUser.id
        }
      })
      
      console.log('Deleted demo user')
    } else {
      console.log('Demo user not found')
    }

    // Cleanup: Delete placeholder images
    console.log('Done! Remember to manually delete these files if needed:')
    console.log('- public/sample-event-1.jpg')
    console.log('- public/sample-event-2.jpg')
    console.log('- public/sample-event-3.jpg')
    console.log('- public/placeholder-event.jpg')
    console.log('- public/roborush-banner.jpg')
  } catch (error) {
    console.error('Error during cleanup:', error)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 