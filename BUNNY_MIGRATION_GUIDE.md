# 🐰 Bunny.net Collection Migration Guide

## Overview

This guide helps you migrate from **separate libraries per course** to **single library with collections** for better cost efficiency and organization.

## 🎯 Benefits of New Architecture

- **💰 Cost Reduction**: Single library instead of multiple libraries
- **🗂️ Better Organization**: Collections keep courses organized
- **⚡ Simplified Management**: One library to rule them all
- **🔧 Easier Maintenance**: Centralized video management

## 🚀 Migration Steps

### Step 1: Run Database Migration

```bash
# Install dependencies if needed
npm install

# Run the migration script
node scripts/migrate-to-collections.mjs
```

This script will:

- ✅ Update video `bunny_video_id` fields to collection format
- ✅ Remove unnecessary `bunny_library_id` from courses
- ✅ Generate missing video IDs from order numbers

### Step 2: Update Environment Variables

Add these to your `.env.local` file:

```bash
# Single Bunny.net library ID for all courses
NEXT_PUBLIC_BUNNY_LIBRARY_ID=your-single-library-id

# Bunny.net API key for management operations
BUNNY_API_KEY=your-bunny-api-key
```

### Step 3: Organize Videos in Bunny.net Dashboard

1. **Login to Bunny.net Dashboard**
2. **Go to your main library**
3. **Create collections (folders) for each course:**

   - `zero-to-hero/`
   - `ai-saas/`
   - `your-course-id/`

4. **Move/Upload videos with collection-based naming:**
   ```
   zero-to-hero/Video1
   zero-to-hero/Video2
   zero-to-hero/Video3
   ...
   ai-saas/Video1
   ai-saas/Video2
   ...
   ```

### Step 4: Test Video Playback

1. **Start your development server:**

   ```bash
   npm run dev
   ```

2. **Test video access:**

   - Login as a user with course access
   - Navigate to course page
   - Click "Watch" on any video
   - Verify video loads and plays correctly

3. **Check progress tracking:**
   - Play video for a few seconds
   - Verify progress is saved in Firebase

## 🔧 Technical Details

### New Video ID Format

**Before (Multiple Libraries):**

```javascript
// Course had its own library
bunny_library_id: "123456";
bunny_video_id: "Video1";
// URL: https://iframe.mediadelivery.net/embed/123456/Video1
```

**After (Single Library with Collections):**

```javascript
// Single library for all courses
bunny_video_id: "zero-to-hero/Video1";
// URL: https://iframe.mediadelivery.net/embed/SINGLE_LIBRARY_ID/zero-to-hero/Video1
```

### Firebase Schema Changes

**Videos Collection:**

```javascript
{
  id: "video-doc-id",
  title: "Introduction to Programming",
  course_id: "zero-to-hero",
  order: 1,
  bunny_video_id: "zero-to-hero/Video1", // ← Collection-based ID
  // bunny_library_id removed - using single library
}
```

**Courses Collection:**

```javascript
{
  id: "zero-to-hero",
  title: "Zero To Hero Bootcamp",
  // bunny_library_id removed - using single library from config
}
```

## 🛠️ Getting Your Bunny.net Credentials

### 1. Get Library ID

1. Login to [Bunny.net Dashboard](https://dash.bunny.net/)
2. Go to **Stream → Libraries**
3. Select your main library
4. Copy the **Library ID** from the URL or settings

### 2. Get API Key

1. In Bunny.net Dashboard, go to **Account → API**
2. Create a new API key or copy existing one
3. Ensure it has **Stream** permissions

### 3. Update Your .env.local

```bash
# Replace with your actual values
NEXT_PUBLIC_BUNNY_LIBRARY_ID=123456
BUNNY_API_KEY=your-api-key-here
```

## 🧪 Testing Checklist

- [ ] Migration script runs without errors
- [ ] Environment variables are set correctly
- [ ] Videos are organized in collections on Bunny.net
- [ ] Video player loads videos correctly
- [ ] Progress tracking works
- [ ] Authentication and course access control works
- [ ] All courses display videos properly

## 🚨 Troubleshooting

### Video Not Loading

- Check if `NEXT_PUBLIC_BUNNY_LIBRARY_ID` is set correctly
- Verify video exists in Bunny.net with correct collection path
- Check browser console for errors

### Progress Not Saving

- Verify Firebase rules allow user progress updates
- Check if user is authenticated
- Look for JavaScript errors in console

### Migration Script Errors

- Ensure Firebase credentials are correct in `.env.local`
- Check if you have read/write permissions to Firestore
- Verify internet connection

## 🎉 Post-Migration Cleanup

Once everything is working:

1. **Remove old Bunny.net libraries** (optional but saves money)
2. **Update any hardcoded library IDs** in your code
3. **Test thoroughly** with real users
4. **Monitor** for any issues in the first few days

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Test with a simple video first
4. Check Firebase Firestore rules and permissions

---

**🎯 You're all set!** Your Bunny.net integration is now more efficient and cost-effective with the collection-based architecture.
