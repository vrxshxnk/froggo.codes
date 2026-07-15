// src/libs/firebaseAdmin.js
// Server-side Firebase Admin SDK initialization for API routes
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (server-side only)
// This will only run in API routes, not in client components
function initializeFirebaseAdmin() {
    if (getApps().length === 0) {
        try {
            initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID?.trim(),
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.trim(),
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/\\n/g, '\n'),
                }),
            });
        } catch (error) {
            console.error('Firebase Admin initialization error:', error);
            throw error;
        }
    }
}

// Initialize on first import
initializeFirebaseAdmin();

// Export admin auth and firestore instances
export const adminAuth = getAuth();
export const adminDb = getFirestore();

/**
 * Verify a Firebase ID token from the Authorization header
 * @param {Request} request - The Next.js request object
 * @returns {Promise<{userId: string, email: string} | null>} - Decoded user info or null
 */
export async function verifyAuthToken(request) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const idToken = authHeader.split('Bearer ')[1];

        if (!idToken) {
            return null;
        }

        const decodedToken = await adminAuth.verifyIdToken(idToken);

        return {
            userId: decodedToken.uid,
            email: decodedToken.email || '',
        };
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return null;
    }
}

/**
 * Verify that the request belongs to a Firebase user with the admin custom claim.
 * @param {Request} request - The Next.js request object
 * @returns {Promise<{userId: string, email: string} | null>} - Admin user info or null
 */
export async function verifyAdminToken(request) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);

        if (decodedToken.admin !== true) {
            return null;
        }

        return {
            userId: decodedToken.uid,
            email: decodedToken.email || '',
        };
    } catch (error) {
        console.error('Admin token verification failed:', error.message);
        return null;
    }
}

/**
 * Check if a user has access to a specific course (server-side)
 * @param {string} userId - The user's Firebase UID
 * @param {string} courseId - The course ID to check access for
 * @returns {Promise<boolean>} - Whether the user has access
 */
export async function verifyUserCourseAccessServer(userId, courseId) {
    try {
        if (!userId || !courseId) {
            return false;
        }

        // Check user_courses collection for enrollment
        const userCourseDoc = await adminDb
            .collection('user_courses')
            .doc(`${userId}_${courseId}`)
            .get();

        if (!userCourseDoc.exists) {
            return false;
        }

        // Also verify payment is completed
        const paymentDoc = await adminDb
            .collection('payments')
            .doc(`${userId}_${courseId}`)
            .get();

        if (!paymentDoc.exists) {
            return false;
        }

        const paymentData = paymentDoc.data();
        return paymentData?.status === 'completed';
    } catch (error) {
        console.error('Server-side course access verification failed:', error);
        return false;
    }
}
