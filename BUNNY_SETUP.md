# Bunny.net Video Streaming Setup Guide

## Overview

This system uses **Firebase Firestore** for video metadata (titles, descriptions, duration) and **Bunny.net** for video streaming. All courses use a **single Bunny.net library** with **collections** for better organization and cost efficiency.

## New Architecture (Collection-Based)

```
Firebase Firestore (Metadata) + Bunny.net (Single Library with Collections)
├── Single Bunny Library: 123456
│   ├── Collection: "zero-to-hero/"
│   │   ├── zero-to-hero/Video1, zero-to-hero/Video2... (30 videos)
│   ├── Collection: "ai-saas/"
│   │   ├── ai-saas/Video1, ai-saas/Video2... (10 videos)
│   └── Collection: "course-name/"
│       ├── course-name/Video1, course-name/Video2...
```

## Step-by-Step Setup for Beginners

### Step 1: Create Single Bunny.net Library

1. **Login to Bunny.net Dashboard**
2. **Create ONE library for all courses:**
   - Go to **Stream → Libraries**
   - Click **"Add Library"**
   - Name it descriptively (e.g., "froggo-courses-main")
   - **Copy the Library ID** (you'll need this!)

**Example:**

- Main Library ID: `123456` (for ALL courses)

### Step 2: Upload Videos Using Collections

**Important:** Use collections (folders) to organize videos by course. Name videos as `courseId/Video1`, `courseId/Video2`, etc.

**In your single library (123456):**

```
Collection: zero-to-hero/
├── zero-to-hero/Video1 (Introduction to Programming)
├── zero-to-hero/Video2 (Variables and Data Types)
├── zero-to-hero/Video3 (Functions and Loops)
...
├── zero-to-hero/Video30 (Final Project)

Collection: ai-saas/
├── ai-saas/Video1 (Project Setup)
├── ai-saas/Video2 (Database Design)
...
├── ai-saas/Video10 (Deployment)
```

### Step 3: Update Firebase Schema

#### Courses Collection

**No changes needed!** Courses remain the same since we use a single library:

```javascript
// Collection: "courses" - NO CHANGES REQUIRED
{
  id: "zero-to-hero",
  title: "Zero To Hero",
  description: "Complete coding bootcamp",
  price: 299,
  // bunny_library_id no longer needed - using single library
  // ... other fields
}

{
  id: "ai-saas",
  title: "Build an AI SaaS",
  description: "Learn to build AI applications",
  price: 199,
  // bunny_library_id no longer needed - using single library
  // ... other fields
}
```

#### Videos Collection

Structure your videos like this:

```javascript
// Videos for "Zero To Hero" course
{
  id: "zth-intro",
  title: "Introduction to Programming",
  description: "Learn the basics of programming",
  duration: "15:30",
  course_id: "zero-to-hero",
  order: 1,                           // Video sequence in course
  bunny_video_id: "zero-to-hero/Video1"  // Collection-based ID
}

{
  id: "zth-variables",
  title: "Variables and Data Types",
  description: "Understanding variables",
  duration: "12:45",
  course_id: "zero-to-hero",
  order: 2,
  bunny_video_id: "zero-to-hero/Video2"  // Collection-based ID
}

// Videos for "AI SaaS" course
{
  id: "ai-setup",
  title: "Project Setup",
  description: "Setting up the development environment",
  duration: "18:20",
  course_id: "ai-saas",
  order: 1,
  bunny_video_id: "ai-saas/Video1"       // Collection-based ID
}
```

### Step 4: Environment Variables

Add to your `.env.local`:

```bash
# Single Bunny.net library ID for all courses
NEXT_PUBLIC_BUNNY_LIBRARY_ID=your-single-library-id
# Bunny.net API key for management operations
BUNNY_API_KEY=your-bunny-api-key
```

## How It All Works Together

### 1. **User Clicks "Watch" Button**

```javascript
// User clicks watch on "Introduction to Programming"
handleWatchVideo(video); // video.bunny_video_id = "zero-to-hero/Video1"
```

### 2. **System Verifies Access**

```javascript
// Check if user purchased the course
const hasAccess = await courseService.verifyUserCourseAccess(userId, courseId);
```

### 3. **Video URL Generation**

```javascript
// Get single library ID: "123456"
// Combine with collection-based video ID: "zero-to-hero/Video1"
// Result: https://iframe.mediadelivery.net/embed/123456/zero-to-hero/Video1
const embedUrl = bunnyUtils.generateEmbedUrl(libraryId, videoId);
```

### 4. **Video Plays & Progress Tracks**

```javascript
// Player.js events automatically update Firebase progress
playerInstance.on("timeupdate", (data) => {
  // Updates user_progress collection
});
```

## Benefits of This Collection-Based Approach

✅ **Cost Efficient**: Single library reduces Bunny.net costs  
✅ **Better Organization**: Collections keep courses separate within one library  
✅ **Simpler Management**: One library to manage instead of multiple  
✅ **Scalable**: Add unlimited courses as collections  
✅ **Secure**: Per-course access control and payment verification maintained  
✅ **Cleaner URLs**: Collection-based video IDs are more organized

## Data Flow Summary

```
User Request → Auth Check → Payment Verification →
Single Library ID + Collection/Video ID → Bunny.net Embed URL →
Video Streams → Progress Tracking → Firebase Update
```

**Key Point:** Video titles, descriptions, and course organization come from **your Firebase database**, not Bunny.net. Bunny.net only provides the video streaming infrastructure.

## Video Setup in Firestore

For each video document in your `videos` collection:

```javascript
{
  // Existing fields
  title: "Introduction to JavaScript",
  duration: "15:30",
  course_id: "zero-to-hero",
  order: 1,

  // Collection-based Bunny.net ID
  bunny_video_id: "zero-to-hero/Video1", // Collection-based ID
  // No bunny_library_id needed - using single library from config
}
```

## Video Naming Convention

Videos in Bunny.net should follow this collection-based naming pattern:

- zero-to-hero/Video1
- zero-to-hero/Video2
- zero-to-hero/Video3
- ai-saas/Video1
- ai-saas/Video2
- etc.

## Features

- ✅ Secure video access with auth + payment verification
- ✅ Automatic progress tracking via Player.js events
- ✅ Modal video player maintaining existing aesthetics
- ✅ Fallback video ID generation following naming convention
- ✅ Integration with existing Firebase schema (no breaking changes)

## Testing

1. Ensure user is logged in and has purchased a course
2. Navigate to course detail page
3. Click "Watch" button on any video
4. Video player modal should open with Bunny.net stream
5. Progress should update automatically as video plays
