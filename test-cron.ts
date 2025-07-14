import { env } from '@/lib/env';
import { NextRequest } from 'next/server';

async function testCronJob() {
  console.log('🧪 Testing cron job locally...');

  try {
    // Create a mock request with the proper authorization header
    const mockRequest = new NextRequest('http://localhost:3000/api/cron/send-event-reminders', {
      method: 'GET',
      headers: {
        'authorization': `Bearer ${env.CRON_SECRET}`,
      },
    });

    // Import and call the cron handler
    const { GET } = await import('./src/app/api/cron/send-event-reminders/route');
    const response = await GET(mockRequest);
    const result = await response.json();

    console.log('📊 Result:', result);
  } catch (error) {
    console.error('❌ Error testing cron job:', error);
  }
}

testCronJob();
