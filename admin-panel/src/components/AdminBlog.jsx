import getApiUrl from '../utils/api.js';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

export function AdminBlog() {
  const { getToken } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    featured_image: '',
    meta_description: '',
    published: false
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const response = await fetch('/api/admin/blog/posts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      if (!token) return;
      
      const url = editingPost 
        ? `/api/admin/blog/posts/${editingPost.id}`
        : '/api/admin/blog/posts';
      
      const response = await fetch(url, {
        method: editingPost ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchPosts();
        setShowAddModal(false);
        setEditingPost(null);
        setFormData({
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          category: '',
          featured_image: '',
          meta_description: '',
          published: false
        });
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category || '',
      featured_image: post.featured_image || '',
      meta_description: post.meta_description || '',
      published: post.published
    });
    setShowAddModal(true);
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const token = await getToken();
        if (!token) return;
        
        const response = await fetch(`/api/admin/blog/posts/${postId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          await fetchPosts();
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return React.createElement('div', { className: 'flex justify-center items-center h-64' },
      React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500' })
    );
  }

  return React.createElement('div', { className: 'space-y-6' },
    // Header
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h2', { className: 'text-[18px] leading-6 font-semibold text-text-primary' }, 'Blog Management'),
      React.createElement('button', {
        onClick: () => setShowAddModal(true),
        className: 'h-9 px-4 rounded-10 bg-brand text-text-inverse font-semibold hover:bg-brand-600 active:bg-brand-700 transition'
      }, 'Add New Post')
    ),

    // Posts table
    React.createElement('div', { className: 'bg-surface rounded-12 shadow-elev1 overflow-hidden border border-line-soft' },
      React.createElement('table', { className: 'min-w-full divide-y divide-line-soft' },
        React.createElement('thead', { className: 'bg-elev2' },
          React.createElement('tr', {},
            React.createElement('th', { className: 'px-6 py-3 text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider' }, 'Title'),
            React.createElement('th', { className: 'px-6 py-3 text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider' }, 'Category'),
            React.createElement('th', { className: 'px-6 py-3 text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider' }, 'Status'),
            React.createElement('th', { className: 'px-6 py-3 text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider' }, 'Date'),
            React.createElement('th', { className: 'px-6 py-3 text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider' }, 'Actions')
          )
        ),
        React.createElement('tbody', { className: 'bg-surface divide-y divide-line-soft' },
          ...posts.map(post =>
            React.createElement('tr', { key: post.id },
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                React.createElement('div', {},
                  React.createElement('div', { className: 'text-[14px] font-semibold text-text-primary' }, post.title),
                  React.createElement('div', { className: 'text-[13px] text-text-secondary' }, `/blog/${post.slug}`)
                )
              ),
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                React.createElement('span', { 
                  className: 'inline-flex px-2 py-1 text-[12px] font-semibold rounded-full bg-[rgba(99,102,241,.12)] text-text-secondary' 
                }, post.category || 'Uncategorized')
              ),
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                React.createElement('span', { 
                  className: `inline-flex px-2 py-1 text-[12px] font-semibold rounded-full ${
                    post.published ? 'bg-[rgba(34,197,94,.12)] text-success' : 'bg-[rgba(245,158,11,.12)] text-warning'
                  }`
                }, post.published ? 'Published' : 'Draft')
              ),
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-[13px] text-text-tertiary' },
                new Date(post.created_at).toLocaleDateString()
              ),
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-[13px] font-medium space-x-2' },
                React.createElement('button', {
                  onClick: () => handleEdit(post),
                  className: 'text-brand hover:opacity-90'
                }, 'Edit'),
                React.createElement('button', {
                  onClick: () => handleDelete(post.id),
                  className: 'text-danger hover:opacity-90'
                }, 'Delete')
              )
            )
          )
        )
      )
    ),

    // Add/Edit Modal
    showAddModal && React.createElement('div', { className: 'fixed inset-0 bg-scrim overflow-y-auto h-full w-full z-50' },
      React.createElement('div', { className: 'relative top-20 mx-auto p-5 border border-line-soft w-11/12 max-w-4xl shadow-elev2 rounded-16 bg-elev1' },
        React.createElement('div', { className: 'mt-3' },
          React.createElement('h3', { className: 'text-[16px] font-semibold text-text-primary mb-4' },
            editingPost ? 'Edit Post' : 'Add New Post'
          ),
          React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-[12px] font-semibold text-text-secondary mb-1' }, 'Title'),
              React.createElement('input', {
                type: 'text',
                value: formData.title,
                onChange: (e) => {
                  const title = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    title,
                    slug: !editingPost ? generateSlug(title) : prev.slug
                  }));
                },
                className: 'w-full h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand',
                required: true
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-[12px] font-semibold text-text-secondary mb-1' }, 'Slug'),
              React.createElement('input', {
                type: 'text',
                value: formData.slug,
                onChange: (e) => setFormData(prev => ({ ...prev, slug: e.target.value })),
                className: 'w-full h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand',
                required: true
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-[12px] font-semibold text-text-secondary mb-1' }, 'Category'),
              React.createElement('input', {
                type: 'text',
                value: formData.category,
                onChange: (e) => setFormData(prev => ({ ...prev, category: e.target.value })),
                className: 'w-full h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand'
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-[12px] font-semibold text-text-secondary mb-1' }, 'Excerpt'),
              React.createElement('textarea', {
                value: formData.excerpt,
                onChange: (e) => setFormData(prev => ({ ...prev, excerpt: e.target.value })),
                rows: 3,
                className: 'w-full px-3 py-3 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand'
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-[12px] font-semibold text-text-secondary mb-1' }, 'Content'),
              React.createElement('textarea', {
                value: formData.content,
                onChange: (e) => setFormData(prev => ({ ...prev, content: e.target.value })),
                rows: 15,
                className: 'w-full px-3 py-3 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand',
                required: true
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-[12px] font-semibold text-text-secondary mb-1' }, 'Featured Image URL'),
              React.createElement('input', {
                type: 'url',
                value: formData.featured_image,
                onChange: (e) => setFormData(prev => ({ ...prev, featured_image: e.target.value })),
                className: 'w-full h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand'
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-[12px] font-semibold text-text-secondary mb-1' }, 'Meta Description'),
              React.createElement('textarea', {
                value: formData.meta_description,
                onChange: (e) => setFormData(prev => ({ ...prev, meta_description: e.target.value })),
                rows: 2,
                className: 'w-full px-3 py-3 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand',
                placeholder: 'SEO meta description (160 characters max)'
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'flex items-center' },
                React.createElement('input', {
                  type: 'checkbox',
                  checked: formData.published,
                  onChange: (e) => setFormData(prev => ({ ...prev, published: e.target.checked })),
                  className: 'mr-2'
                }),
                React.createElement('span', { className: 'text-[12px] font-medium text-text-secondary' }, 'Published')
              )
            ),
            React.createElement('div', { className: 'flex justify-end space-x-3 pt-4' },
              React.createElement('button', {
                type: 'button',
                onClick: () => {
                  setShowAddModal(false);
                  setEditingPost(null);
                  setFormData({
                    title: '',
                    slug: '',
                    excerpt: '',
                    content: '',
                    category: '',
                    featured_image: '',
                    meta_description: '',
                    published: false
                  });
                },
                className: 'h-9 px-4 border border-line-strong rounded-10 text-text-secondary hover:bg-hover'
              }, 'Cancel'),
              React.createElement('button', {
                type: 'submit',
                className: 'h-9 px-4 bg-brand text-text-inverse rounded-10 hover:bg-brand-600'
              }, editingPost ? 'Update Post' : 'Create Post')
            )
          )
        )
      )
    )
  );
}

export default AdminBlog;