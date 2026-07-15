// src/app/api/get-video-url/route.js
// Secure API route for generating signed Bunny.net video URLs.
// Previews and the landing-page intro video are signable without sign-in;
// everything else requires authentication + verified course purchase.
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyAuthToken, verifyUserCourseAccessServer, adminDb } from '@/libs/firebaseAdmin';
import { videoUrlRateLimiter, checkRateLimit } from '@/libs/ratelimit';
import config from '@/config';

// Token expiry time (30 minutes in seconds)
const TOKEN_EXPIRY_SECONDS = 30 * 60;

/**
 * Generate a signed Bunny.net embed URL using Bunny Stream's embed token
 * authentication: token = SHA256_HEX(token_security_key + video_id + expiration).
 * Note: only the video GUID is hashed — the library ID/path is NOT part of
 * the signature, and the digest is hex (not base64).
 * @param {string} libraryId - Bunny.net library ID
 * @param {string} videoId - The Bunny video GUID
 * @param {string} tokenAuthKey - The embed token authentication key from Bunny.net
 * @param {number} expiresAt - Unix timestamp when the token expires
 * @returns {string} Signed embed URL
 */
function generateSignedEmbedUrl(libraryId, videoId, tokenAuthKey, expiresAt) {
    const token = crypto
        .createHash('sha256')
        .update(`${tokenAuthKey}${videoId}${expiresAt}`)
        .digest('hex');

    return `${config.bunny.embedBaseUrl}/${libraryId}/${videoId}?token=${token}&expires=${expiresAt}`;
}

export async function POST(request) {
    try {
        // 1. Identify the caller — auth is optional (previews are public),
        // access-controlled videos enforce it below
        const authResult = await verifyAuthToken(request);

        // 2. Rate limiting — per user when signed in, per IP otherwise
        const rateLimitIdentifier = authResult
            ? authResult.userId
            : `ip:${request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'}`;
        const rateLimitResult = await checkRateLimit(videoUrlRateLimiter, rateLimitIdentifier);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests. Please slow down.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
                    }
                }
            );
        }

        // 3. Parse request body
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON payload' },
                { status: 400 }
            );
        }

        const { videoId } = body;

        // 4. Validate input — videoId is the Bunny video GUID stored in the
        // Firestore video document (bunny_video_id)
        if (typeof videoId !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(videoId)) {
            return NextResponse.json(
                { error: 'A valid videoId is required' },
                { status: 400 }
            );
        }

        // 5. Authorize
        const isIntroVideo =
            config.bunny.introVideoId && videoId === config.bunny.introVideoId;

        if (!isIntroVideo) {
            // Resolve the video document by its Bunny GUID. The course used for
            // the access check comes from the document, never from the client —
            // owning course A must not sign course B's videos.
            const videoSnapshot = await adminDb
                .collection('videos')
                .where('bunny_video_id', '==', videoId)
                .limit(1)
                .get();

            if (videoSnapshot.empty) {
                return NextResponse.json(
                    { error: 'Video not found' },
                    { status: 404 }
                );
            }

            const videoData = videoSnapshot.docs[0].data();

            if (!videoData.is_preview) {
                if (!authResult) {
                    return NextResponse.json(
                        { error: 'Authentication required' },
                        { status: 401 }
                    );
                }

                const hasAccess = await verifyUserCourseAccessServer(
                    authResult.userId,
                    videoData.course_id
                );

                if (!hasAccess) {
                    return NextResponse.json(
                        { error: 'You do not have access to this course. Please purchase it first.' },
                        { status: 403 }
                    );
                }
            }
        }

        // 6. Generate signed URL
        const tokenAuthKey = process.env.BUNNY_TOKEN_AUTH_KEY;

        if (!tokenAuthKey) {
            console.error('BUNNY_TOKEN_AUTH_KEY is not configured');
            return NextResponse.json(
                { error: 'Video service configuration error' },
                { status: 500 }
            );
        }

        const libraryId = config.bunny.libraryId;

        if (!libraryId || libraryId === 'your-library-id') {
            console.error('Bunny library ID is not configured');
            return NextResponse.json(
                { error: 'Video service configuration error' },
                { status: 500 }
            );
        }

        const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS;
        const signedUrl = generateSignedEmbedUrl(libraryId, videoId, tokenAuthKey, expiresAt);

        return NextResponse.json({
            url: signedUrl,
            expiresAt: expiresAt,
            expiresIn: TOKEN_EXPIRY_SECONDS,
        });

    } catch (error) {
        console.error('Error generating video URL:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json(
            { error: 'Failed to generate video URL. Please try again.' },
            { status: 500 }
        );
    }
}

// Explicitly deny other HTTP methods
export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
