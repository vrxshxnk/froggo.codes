import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';

const postsDirectory = path.join(process.cwd(), 'content/blog');

// Input validation for query parameters
function validateQueryParams(type, tag) {
  const errors = [];
  
  if (type !== null) {
    if (typeof type !== 'string') {
      errors.push('Type parameter must be a string');
    } else if (type.length > 20) {
      errors.push('Type parameter too long');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(type)) {
      errors.push('Type parameter contains invalid characters');
    }
  }
  
  if (tag !== null) {
    if (typeof tag !== 'string') {
      errors.push('Tag parameter must be a string');
    } else if (tag.length > 50) {
      errors.push('Tag parameter too long');
    } else if (!/^[a-zA-Z0-9_\s-]+$/.test(tag)) {
      errors.push('Tag parameter contains invalid characters');
    }
  }
  
  return errors;
}

function getAllPosts() {
  try {
    if (!fs.existsSync(postsDirectory)) {
      console.warn('Blog posts directory does not exist:', postsDirectory);
      return [];
    }
    
    const filenames = fs.readdirSync(postsDirectory);
    const posts = filenames
      .filter(name => {
        // Only allow .md files and validate filename
        if (!name.endsWith('.md')) return false;
        if (name.length > 100) return false;
        if (!/^[a-zA-Z0-9_-]+\.md$/.test(name)) return false;
        return true;
      })
      .map(name => {
        try {
          const fullPath = path.join(postsDirectory, name);
          
          // Additional path safety check
          const resolvedPath = path.resolve(fullPath);
          const resolvedPostsDir = path.resolve(postsDirectory);
          
          if (!resolvedPath.startsWith(resolvedPostsDir)) {
            console.warn('Skipping file outside posts directory:', name);
            return null;
          }
          
          const fileContents = fs.readFileSync(resolvedPath, 'utf8');
          const { data, content } = matter(fileContents);
          
          // Sanitize and validate post data
          return {
            slug: name.replace(/\.md$/, ''),
            title: typeof data.title === 'string' ? data.title : 'Untitled',
            excerpt: typeof data.excerpt === 'string' ? data.excerpt : '',
            date: data.date instanceof Date ? data.date.toISOString() : 
                  (typeof data.date === 'string' ? data.date : new Date().toISOString()),
            author: typeof data.author === 'string' ? data.author : 'Unknown',
            tags: Array.isArray(data.tags) ? 
                  data.tags.filter(tag => typeof tag === 'string' && tag.length <= 50) : [],
            featured: Boolean(data.featured),
            content: typeof content === 'string' ? content : ''
          };
        } catch (fileError) {
          console.error(`Error processing file ${name}:`, fileError);
          return null;
        }
      })
      .filter(post => post !== null) // Remove failed posts
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return [];
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const tag = searchParams.get('tag');
    const limit = searchParams.get('limit');

    // Validate query parameters
    const validationErrors = validateQueryParams(type, tag);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationErrors },
        { status: 400 }
      );
    }

    // Validate limit parameter
    let parsedLimit = null;
    if (limit !== null) {
      parsedLimit = parseInt(limit, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        return NextResponse.json(
          { error: 'Limit must be a number between 1 and 100' },
          { status: 400 }
        );
      }
    }

    const allPosts = getAllPosts();

    let posts = allPosts;

    // Apply filters
    if (type === 'featured') {
      posts = allPosts.filter(post => post.featured);
    } else if (tag && tag.trim()) {
      const sanitizedTag = tag.trim().toLowerCase();
      posts = allPosts.filter(post => 
        post.tags.some(postTag => postTag.toLowerCase().includes(sanitizedTag))
      );
    }

    // Apply limit
    if (parsedLimit) {
      posts = posts.slice(0, parsedLimit);
    }

    // Get all unique tags (sanitized)
    const allTags = [...new Set(
      allPosts
        .flatMap(post => post.tags)
        .filter(tag => typeof tag === 'string' && tag.length <= 50)
    )].sort();

    return NextResponse.json({
      posts,
      tags: allTags,
      total: posts.length,
      totalAvailable: allPosts.length
    });
  } catch (error) {
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch posts' }, 
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