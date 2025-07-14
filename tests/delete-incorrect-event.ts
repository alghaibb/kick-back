// Delete the incorrectly stored event
import prisma from './src/lib/prisma'

async function deleteIncorrectEvent() {
  console.log('🗑️ Deleting incorrectly stored event...\n')

  // Find the problematic event
  const event = await prisma.event.findFirst({
    where: {
      date: new Date('2025-07-14T20:43:00.000Z') // The incorrectly stored UTC time
    }
  })

  if (!event) {
    console.log('❌ Event not found')
    return
  }

  console.log(`Found event: "${event.name}"`)
  console.log(`Stored incorrectly as: ${event.date.toISOString()}`)

  // Delete attendees first
  await prisma.eventAttendee.deleteMany({
    where: { eventId: event.id }
  })

  // Delete the event
  await prisma.event.delete({
    where: { id: event.id }
  })

  console.log('✅ Deleted incorrectly stored event!')
  console.log('Now try creating a new event with the fixed logic.')
}

deleteIncorrectEvent()
  .catch(console.error)
  .finally(() => process.exit(0))
