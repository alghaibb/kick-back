// Debug why cron job returns 200 but no emails/SMS sent
import { addDays, addMinutes, endOfDay, startOfDay, subMinutes } from 'date-fns'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import prisma from './src/lib/prisma'

async function debugCronReminders() {
  console.log('🔍 Debugging cron reminder logic...\n')

  // Get your user
  const user = await prisma.user.findFirst({
    where: { email: 'mjaderi97@gmail.com' }
  })

  if (!user) {
    console.log('❌ User not found')
    return
  }

  console.log('👤 User Info:')
  console.log(`Email: ${user.email}`)
  console.log(`Reminder Time: ${user.reminderTime}`)
  console.log(`Reminder Type: ${user.reminderType}`)
  console.log(`Timezone: ${user.timezone}`)
  console.log(`Phone: ${user.phoneNumber || 'N/A'}\n`)

  // Get latest event
  const event = await prisma.event.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      attendees: {
        where: { userId: user.id }
      }
    }
  })

  if (!event) {
    console.log('❌ No events found')
    return
  }

  console.log('📅 Latest Event:')
  console.log(`Name: ${event.name}`)
  console.log(`Date (UTC): ${event.date.toISOString()}`)
  console.log(`Attendees for this user: ${event.attendees.length}\n`)

  // Simulate cron logic
  const userTimezone = user.timezone || 'UTC'
  const userNow = toZonedTime(new Date(), userTimezone)

  console.log('🕐 Current Time Analysis:')
  console.log(`Server time (UTC): ${new Date().toISOString()}`)
  console.log(`User time (${userTimezone}): ${formatInTimeZone(new Date(), userTimezone, 'yyyy-MM-dd HH:mm:ss')}`)

  // Check if event is tomorrow
  const userEventDate = toZonedTime(event.date, userTimezone)
  const userTomorrowStart = startOfDay(addDays(userNow, 1))
  const userTomorrowEnd = endOfDay(addDays(userNow, 1))

  const isEventTomorrow = userEventDate >= userTomorrowStart && userEventDate <= userTomorrowEnd

  console.log('\n📆 Event Tomorrow Check:')
  console.log(`Event date in user TZ: ${formatInTimeZone(event.date, userTimezone, 'yyyy-MM-dd HH:mm:ss')}`)
  console.log(`Tomorrow range: ${formatInTimeZone(userTomorrowStart, userTimezone, 'yyyy-MM-dd HH:mm:ss')} to ${formatInTimeZone(userTomorrowEnd, userTimezone, 'yyyy-MM-dd HH:mm:ss')}`)
  console.log(`Is event tomorrow? ${isEventTomorrow ? '✅ YES' : '❌ NO'}`)

  // Check reminder window
  const [reminderHour, reminderMinute] = user.reminderTime.split(':').map(Number)
  const reminderDateTime = new Date(userNow)
  reminderDateTime.setHours(reminderHour, reminderMinute, 0, 0)

  const windowStart = subMinutes(reminderDateTime, 2)
  const windowEnd = addMinutes(reminderDateTime, 3)

  const isInWindow = userNow >= windowStart && userNow <= windowEnd

  console.log('\n⏰ Reminder Window Check:')
  console.log(`Current user time: ${formatInTimeZone(userNow, userTimezone, 'HH:mm:ss')}`)
  console.log(`Reminder time: ${user.reminderTime}`)
  console.log(`Window: ${formatInTimeZone(windowStart, userTimezone, 'HH:mm:ss')} to ${formatInTimeZone(windowEnd, userTimezone, 'HH:mm:ss')}`)
  console.log(`Is in window? ${isInWindow ? '✅ YES' : '❌ NO'}`)

  // Check if reminder already sent
  const attendee = event.attendees[0]
  const today = startOfDay(userNow)
  const alreadySent = attendee && attendee.lastReminderSent && attendee.lastReminderSent >= today

  console.log('\n📨 Reminder Sent Check:')
  if (attendee) {
    console.log(`Last reminder sent: ${attendee.lastReminderSent ? attendee.lastReminderSent.toISOString() : 'Never'}`)
    console.log(`Today starts: ${today.toISOString()}`)
    console.log(`Already sent today? ${alreadySent ? '❌ YES (blocked)' : '✅ NO (can send)'}`)
  } else {
    console.log('❌ User is not an attendee of this event')
  }

  console.log('\n🎯 SUMMARY:')
  console.log(`Event tomorrow: ${isEventTomorrow ? '✅' : '❌'}`)
  console.log(`In reminder window: ${isInWindow ? '✅' : '❌'}`)
  console.log(`Not sent already: ${alreadySent ? '❌' : '✅'}`)
  console.log(`Is attendee: ${attendee ? '✅' : '❌'}`)

  const shouldSend = isEventTomorrow && isInWindow && !alreadySent && attendee
  console.log(`\n🚀 SHOULD SEND REMINDER: ${shouldSend ? '✅ YES' : '❌ NO'}`)

  if (!shouldSend) {
    console.log('\n💡 WHY NOT SENDING:')
    if (!isEventTomorrow) console.log('   - Event is not tomorrow')
    if (!isInWindow) console.log('   - Not in reminder window (need to wait for the right time)')
    if (alreadySent) console.log('   - Reminder already sent today')
    if (!attendee) console.log('   - User is not an attendee of the event')
  }
}

debugCronReminders()
  .catch(console.error)
  .finally(() => process.exit(0))
