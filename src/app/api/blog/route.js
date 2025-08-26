import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';

const postsDirectory = path.join(process.cwd(), 'content/blog');

function getAllPosts() {
  try {
    const filenames = fs.readdirSync(postsDirectory);
    const posts = filenames
      .filter(name => name.endsWith('.md'))
      .map(name => {
        const fullPath = path.join(postsDirectory, name);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        
        return {
          slug: name.replace(/\.md$/, ''),
          title: data.title,
          excerpt: data.excerpt,
          date: data.date,
          author: data.author,
          tags: data.tags || [],
          featured: data.featured || false,
          content,
          ...data
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const tag = searchParams.get('tag');

    const allPosts = getAllPosts();

    let posts = allPosts;

    if (type === 'featured') {
      posts = allPosts.filter(post => post.featured);
    } else if (tag) {
      posts = allPosts.filter(post => post.tags.includes(tag));
    }

    // Get all unique tags
    const allTags = [...new Set(allPosts.flatMap(post => post.tags))].sort();

    return NextResponse.json({
      posts,
      tags: allTags,
      total: posts.length
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}