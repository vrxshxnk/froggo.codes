// src/app/api/waitlist/route.js
// Public waitlist signup endpoint — writes to Firestore, rate-limited by IP.
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/libs/firebaseAdmin';
import { generalRateLimiter, checkRateLimit } from '@/libs/ratelimit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getClientIp(req) {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req) {
  try {
    const ip = getClientIp(req);

    const rateLimit = await checkRateLimit(generalRateLimiter, `waitlist:${ip}`);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again shortly.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
          },
        }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const rawEmail = typeof body?.email === 'string' ? body.email : '';
    const email = rawEmail.trim().toLowerCase();

    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Use a hash of the normalized email as the doc ID so re-submissions
    // merge into the same record (natural dedup) and the doc ID never contains
    // characters Firestore disallows.
    const docId = createHash('sha256').update(email).digest('hex');
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const docRef = adminDb.collection('waitlist').doc(docId);
    const existing = await docRef.get();

    if (existing.exists) {
      await docRef.set(
        {
          lastSeenAt: FieldValue.serverTimestamp(),
          submissionCount: FieldValue.increment(1),
        },
        { merge: true }
      );
    } else {
      await docRef.set({
        email,
        createdAt: FieldValue.serverTimestamp(),
        lastSeenAt: FieldValue.serverTimestamp(),
        submissionCount: 1,
        ip,
        userAgent,
        source: 'index-waitlist',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Waitlist signup failed:', {
      message: error.message,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
