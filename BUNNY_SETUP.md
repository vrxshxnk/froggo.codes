# Bunny.net Video Streaming Setup Guide

## Overview

This system uses **Firebase Firestore** for video metadata (titles, descriptions, duration) and **Bunny.net** for video streaming. Each course gets its own Bunny.net library for better organization.

## Architecture

```
Firebase Firestore (Metadata) + Bunny.net (Video Streaming)
├── Course: "Zero To Hero" → Bunny Library: 123456
│   ├── Video1, Video2, Video3... (30 videos)
├── Course: "AI SaaS" → Bunny Library: 789012
│   ├── Video1, Video2, Video3... (10 videos)
```

## Step-by-Step Setup for Beginners

### Step 1: Create Bunny.net Libraries

1. **Login to Bunny.net Dashboard**
2. **For each course, create a separate library:**
   - Go to **Stream → Libraries**
   - Click **"Add Library"**
   - Name it descriptively (e.g., "zero-to-hero-course")
   - **Copy the Library ID** (you'll need this!)

**Example:**

- Course "Zero To Hero" → Library ID: `123456`
- Course "AI SaaS" → Library ID: `789012`

### Step 2: Upload Videos to Libraries

**Important:** Name videos simply as `Video1`, `Video2`, `Video3`, etc. within each library.

**For "Zero To Hero" library (123456):**

```
Video1 (Introduction to Programming)
Video2 (Variables and Data Types)
Video3 (Functions and Loops)
...
Video30 (Final Project)
```

**For "AI SaaS" library (789012):**

```
Video1 (Project Setup)
Video2 (Database Design)
...
Video10 (Deployment)
```

### Step 3: Update Firebase Schema

#### Courses Collection

Add `bunny_library_id` to each course:

```javascript
// Collection: "courses"
{
  id: "zero-to-hero",
  title: "Zero To Hero",
  description: "Complete coding bootcamp",
  price: 299,
  bunny_library_id: "123456",  // ← Add this!
  // ... other fields
}

{
  id: "ai-saas",
  title: "Build an AI SaaS",
  description: "Learn to build AI applications",
  price: 199,
  bunny_library_id: "789012",  // ← Add this!
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
  order: 1,                    // Video sequence in course
  bunny_video_id: "Video1"     // Matches Bunny.net video name
}

{
  id: "zth-variables",
  title: "Variables and Data Types",
  description: "Understanding variables",
  duration: "12:45",
  course_id: "zero-to-hero",
  order: 2,
  bunny_video_id: "Video2"
}

// Videos for "AI SaaS" course
{
  id: "ai-setup",
  title: "Project Setup",
  description: "Setting up the development environment",
  duration: "18:20",
  course_id: "ai-saas",
  order: 1,
  bunny_video_id: "Video1"     // Same naming, different library!
}
```

### Step 4: Environment Variables

Add to your `.env.local`:

```bash
# Fallback library ID (optional, for backward compatibility)
NEXT_PUBLIC_BUNNY_LIBRARY_ID=your-default-library-id
```

## How It All Works Together

### 1. **User Clicks "Watch" Button**

```javascript
// User clicks watch on "Introduction to Programming"
handleWatchVideo(video); // video.bunny_video_id = "Video1"
```

### 2. **System Verifies Access**

```javascript
// Check if user purchased the course
const hasAccess = await courseService.verifyUserCourseAccess(userId, courseId);
```

### 3. **Video URL Generation**

```javascript
// Get course's library ID: "123456"
// Combine with video ID: "Video1"
// Result: https://iframe.mediadelivery.net/embed/123456/Video1
const embedUrl = bunnyUtils.generateEmbedUrl(libraryId, videoId);
```

### 4. **Video Plays & Progress Tracks**

```javascript
// Player.js events automatically update Firebase progress
playerInstance.on("timeupdate", (data) => {
  // Updates user_progress collection
});
```

## Benefits of This Approach

✅ **Better Organization**: Each course has its own video library  
✅ **Simpler Video Names**: Just Video1, Video2, etc. per course  
✅ **Easier Management**: Upload/manage videos per course separately  
✅ **Scalable**: Add unlimited courses without naming conflicts  
✅ **Secure**: Per-course access control and payment verification

## Data Flow Summary

```
User Request → Auth Check → Payment Verification →
Course Library ID + Video ID → Bunny.net Embed URL →
Video Streams → Progress Tracking → Firebase Update
```

**Key Point:** Video titles, descriptions, and course organization come from **your Firebase database**, not Bunny.net. Bunny.net only provides the video streaming infrastructure.

## Video Setup in Firestore

For each video document in your `videos` collection, you can optionally add:

```javascript
{
  // Existing fields
  title: "Introduction to JavaScript",
  duration: "15:30",
  course_id: "Course1",

  // New optional fields for Bunny.net
  bunny_video_id: "Course1-Video1", // Will auto-generate if not present
  bunny_library_id: "your-library-id" // Uses env var if not present
}
```

## Video Naming Convention

Videos in Bunny.net should follow this naming pattern:

- Course1-Video1
- Course1-Video2
- Course1-Video3
- Course2-Video1
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
