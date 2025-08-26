export const blogService = {
  async getAllPosts() {
    try {
      const response = await fetch('/api/blog');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      return data.posts;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
  },

  async getPostBySlug(slug) {
    try {
      const response = await fetch(`/api/blog/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch post');
      }
      const data = await response.json();
      return data.post;
    } catch (error) {
      console.error(`Error fetching blog post ${slug}:`, error);
      return null;
    }
  },

  async getFeaturedPosts() {
    try {
      const response = await fetch('/api/blog?type=featured');
      if (!response.ok) {
        throw new Error('Failed to fetch featured posts');
      }
      const data = await response.json();
      return data.posts;
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      return [];
    }
  },

  async getPostsByTag(tag) {
    try {
      const response = await fetch(`/api/blog?tag=${encodeURIComponent(tag)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts by tag');
      }
      const data = await response.json();
      return data.posts;
    } catch (error) {
      console.error(`Error fetching posts by tag ${tag}:`, error);
      return [];
    }
  },

  async getAllTags() {
    try {
      const response = await fetch('/api/blog');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      const data = await response.json();
      return data.tags;
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  }
};