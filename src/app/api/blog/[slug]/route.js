import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';

const postsDirectory = path.join(process.cwd(), 'content/blog');

// Input validation for slug
function validateSlug(slug) {
  if (typeof slug !== 'string') return false;
  if (slug.length === 0 || slug.length > 100) return false;
  // Only allow alphanumeric, hyphens, underscores (no path traversal)
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) return false;
  // Prevent directory traversal patterns
  if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) return false;
  return true;
}

export async function GET(request, { params }) {
  try {
    const slug = params?.slug;
    
    // Validate slug parameter
    if (!validateSlug(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug parameter' }, 
        { status: 400 }
      );
    }

    // Construct safe file path
    const sanitizedSlug = slug.replace(/[^a-zA-Z0-9_-]/g, '');
    const fullPath = path.join(postsDirectory, `${sanitizedSlug}.md`);
    
    // Ensure the resolved path is still within the posts directory (prevent path traversal)
    const resolvedPath = path.resolve(fullPath);
    const resolvedPostsDir = path.resolve(postsDirectory);
    
    if (!resolvedPath.startsWith(resolvedPostsDir)) {
      return NextResponse.json(
        { error: 'Invalid file path' }, 
        { status: 400 }
      );
    }
    
    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const fileContents = fs.readFileSync(resolvedPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Sanitize and validate the post data
    const post = {
      slug: sanitizedSlug,
      content: typeof content === 'string' ? content : '',
      title: typeof data.title === 'string' ? data.title : 'Untitled',
      excerpt: typeof data.excerpt === 'string' ? data.excerpt : '',
      date: data.date instanceof Date ? data.date.toISOString() : 
            (typeof data.date === 'string' ? data.date : new Date().toISOString()),
      author: typeof data.author === 'string' ? data.author : 'Unknown',
      tags: Array.isArray(data.tags) ? data.tags.filter(tag => typeof tag === 'string') : [],
      featured: Boolean(data.featured)
    };

    return NextResponse.json({ post });
  } catch (error) {
    console.error(`API Error fetching post:`, {
      slug: params?.slug,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch post' }, 
      { status: 500 }
    );
  }
}

// Explicitly deny other methods
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}