// src/app/api/waitlist/route.js
// Public waitlist signup endpoint — writes to the Firestore `waitlist`
// collection via the Admin SDK, rate-limited per IP.
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

    const rateLimitResult = await checkRateLimit(generalRateLimiter, `waitlist:${ip}`);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
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
        source: 'waitlist-modal',
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
