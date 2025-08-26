import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export async function GET(request, { params }) {
  try {
    const slug = params.slug;
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const post = {
      slug,
      content,
      title: data.title,
      excerpt: data.excerpt,
      date: data.date,
      author: data.author,
      tags: data.tags || [],
      featured: data.featured || false,
      ...data
    };

    return NextResponse.json({ post });
  } catch (error) {
    console.error(`API Error fetching post ${params.slug}:`, error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}