// Debug user timezone and event display issue
import { formatInTimeZone } from 'date-fns-tz'
import prisma from './src/lib/prisma'

async function debugUserTimezone() {
    console.log('🔍 Debugging user timezone and event display...\n')

    // Get the first user (assuming that's you)
    const user = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' }
    })

    if (!user) {
        console.log('❌ No user found')
        return
    }

    console.log('👤 User Info:')
    console.log(`Email: ${user.email}`)
    console.log(`Timezone: ${user.timezone}`)
    console.log(`Created: ${user.createdAt}`)

    // Get the latest event
    const event = await prisma.event.findFirst({
        orderBy: { createdAt: 'desc' }
    })

    if (!event) {
        console.log('❌ No events found')
        return
    }

    console.log(`\n📅 Latest Event:`)
    console.log(`Name: ${event.name}`)
    console.log(`Date in DB (UTC): ${event.date.toISOString()}`)
    console.log(`Date in DB (Local): ${event.date.toString()}`)

    // Test how it would display with different timezone values
    const timezoneTests = [
        user.timezone,
        'Australia/Sydney',
        'UTC',
        null,
        undefined
    ]

    console.log(`\n🌏 How this event displays with different timezone values:`)
    console.log('='.repeat(60))

    for (const tz of timezoneTests) {
        try {
            const displayTz = tz || 'UTC'
            const display = formatInTimeZone(
                event.date,
                displayTz,
                "h:mm a (zzz) - eeee, MMMM do"
            )
            console.log(`${String(tz).padEnd(20)} → ${display}`)
        } catch (error) {
            console.log(`${String(tz).padEnd(20)} → ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    // Check if there are any session issues
    const sessions = await prisma.session.findMany({
        where: { userId: user.id },
        include: { user: { select: { timezone: true } } }
    })

    console.log(`\n🔐 Active Sessions: ${sessions.length}`)
    for (const session of sessions) {
        console.log(`Session timezone: ${session.user.timezone}`)
    }
}

debugUserTimezone()
    .catch(console.error)
    .finally(() => process.exit(0))
