// src/app/api/course-curriculum/route.js
// Public, cached curriculum listing for a course — titles and durations only.
// Bunny GUIDs are exposed only for preview videos (they are unplayable
// without a signed token anyway). Keeps the Firestore `videos` collection
// locked down while letting the landing page show the full syllabus.
import { NextResponse } from 'next/server';
import { adminDb } from '@/libs/firebaseAdmin';

export async function GET(request) {
    try {
        const courseId = new URL(request.url).searchParams.get('courseId');

        if (!courseId || !/^[a-zA-Z0-9_-]{1,50}$/.test(courseId)) {
            return NextResponse.json({ error: 'Invalid courseId' }, { status: 400 });
        }

        const snapshot = await adminDb
            .collection('videos')
            .where('course_id', '==', courseId)
            .get();

        const videos = snapshot.docs
            .map((doc) => {
                const data = doc.data();
                const isPreview = Boolean(data.is_preview);

                return {
                    id: doc.id,
                    title: data.title || 'Untitled lesson',
                    duration: data.duration || '',
                    order: data.order || 0,
                    is_preview: isPreview,
                    // GUID only for previews — needed to request a signed preview URL
                    ...(isPreview && data.bunny_video_id
                        ? { bunny_video_id: data.bunny_video_id }
                        : {}),
                };
            })
            .sort((a, b) => a.order - b.order);

        return NextResponse.json(
            { courseId, count: videos.length, videos },
            {
                headers: {
                    // Cache at the CDN for 5 minutes — curriculum changes rarely
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
                },
            }
        );
    } catch (error) {
        console.error('Curriculum fetch failed:', error.message);
        return NextResponse.json({ error: 'Failed to load curriculum' }, { status: 500 });
    }
}
