import { NextResponse } from 'next/server';
import prisma from './prisma';

type Options = {
  interval?: number; // in milliseconds
};

type RateLimitType = 'ip' | 'email' | 'combined';

export function rateLimit(options?: Options) {
  const interval = options?.interval || 60000; // default 1 minute

  return {
    check: async (
      limit: number,
      type: RateLimitType = 'ip',
      identifier?: string,
      ip?: string
    ) => {
      return new Promise<void>(async (resolve, reject) => {
        let key: string;

        switch (type) {
          case 'ip':
            if (!ip) {
              reject(NextResponse.json({ error: 'IP address required.' }, { status: 400 }));
              return;
            }
            key = `ip:${ip}`;
            break;

          case 'email':
            if (!identifier) {
              reject(NextResponse.json({ error: 'Email identifier required.' }, { status: 400 }));
              return;
            }
            key = `email:${identifier.toLowerCase()}`;
            break;

          case 'combined':
            if (!ip || !identifier) {
              reject(NextResponse.json({ error: 'IP and email required.' }, { status: 400 }));
              return;
            }
            key = `combined:${ip}:${identifier.toLowerCase()}`;
            break;

          default:
            reject(NextResponse.json({ error: 'Invalid rate limit type.' }, { status: 400 }));
            return;
        }

        try {
          const now = new Date();
          const resetAt = new Date(now.getTime() + interval);

          // Use upsert to either create a new counter or update existing one
          const counter = await prisma.rateLimitCounter.upsert({
            where: { key },
            update: {
              count: {
                increment: 1
              },
              resetAt,
              updatedAt: now
            },
            create: {
              key,
              count: 1,
              resetAt,
            }
          });

          if (counter.resetAt < now) {
            await prisma.rateLimitCounter.update({
              where: { key },
              data: {
                count: 1,
                resetAt,
                updatedAt: now
              }
            });
            resolve();
            return;
          }

          const currentUsage = counter.count;
          const isRateLimited = currentUsage > limit;

          if (isRateLimited) {
            const response = NextResponse.json(
              { error: 'Too many requests, please try again later.' },
              { status: 429 },
            );
            response.headers.set('X-RateLimit-Limit', limit.toString());
            response.headers.set('X-RateLimit-Remaining', '0');
            response.headers.set('X-RateLimit-Reset', counter.resetAt.toISOString());
            reject(response);
          } else {
            resolve();
          }
        } catch (error) {
          console.error('Rate limiting error:', error);
          reject(NextResponse.json({ error: 'Rate limiting error.' }, { status: 500 }));
        }
      });
    },
  };
}

// Cleanup function to remove expired counters (can be run periodically)
export async function cleanupExpiredCounters() {
  try {
    await prisma.rateLimitCounter.deleteMany({
      where: {
        resetAt: {
          lt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up expired counters:', error);
  }
}
