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
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, 'Blog Management'),
      React.createElement('button', {
        onClick: () => setShowAddModal(true),
        className: 'bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors'
      }, 'Add New Post')
    ),

    // Posts table
    React.createElement('div', { className: 'bg-white rounded-lg shadow overflow-hidden' },
      React.createElement('table', { className: 'min-w-full divide-y divide-gray-200' },
        React.createElement('thead', { className: 'bg-gray-50' },
          React.createElement('tr', {},
            React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Title'),
            React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Category'),
            React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Status'),
            React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Date'),
            React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Actions')
          )
        ),
        React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
          ...posts.map(post =>
            React.createElement('tr', { key: post.id },
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                React.createElement('div', {},
                  React.createElement('div', { className: 'text-sm font-medium text-gray-900' }, post.title),
                  React.createElement('div', { className: 'text-sm text-gray-500' }, `/blog/${post.slug}`)
                )
              ),
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                React.createElement('span', { 
                  className: 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800' 
                }, post.category || 'Uncategorized')
              ),
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                React.createElement('span', { 
                  className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`
                }, post.published ? 'Published' : 'Draft')
              ),
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
                new Date(post.created_at).toLocaleDateString()
              ),
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2' },
                React.createElement('button', {
                  onClick: () => handleEdit(post),
                  className: 'text-cyan-600 hover:text-cyan-900'
                }, 'Edit'),
                React.createElement('button', {
                  onClick: () => handleDelete(post.id),
                  className: 'text-red-600 hover:text-red-900'
                }, 'Delete')
              )
            )
          )
        )
      )
    ),

    // Add/Edit Modal
    showAddModal && React.createElement('div', { className: 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50' },
      React.createElement('div', { className: 'relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white' },
        React.createElement('div', { className: 'mt-3' },
          React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-4' },
            editingPost ? 'Edit Post' : 'Add New Post'
          ),
          React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Title'),
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
                className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500',
                required: true
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Slug'),
              React.createElement('input', {
                type: 'text',
                value: formData.slug,
                onChange: (e) => setFormData(prev => ({ ...prev, slug: e.target.value })),
                className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500',
                required: true
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Category'),
              React.createElement('input', {
                type: 'text',
                value: formData.category,
                onChange: (e) => setFormData(prev => ({ ...prev, category: e.target.value })),
                className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500'
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Excerpt'),
              React.createElement('textarea', {
                value: formData.excerpt,
                onChange: (e) => setFormData(prev => ({ ...prev, excerpt: e.target.value })),
                rows: 3,
                className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500'
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Content'),
              React.createElement('textarea', {
                value: formData.content,
                onChange: (e) => setFormData(prev => ({ ...prev, content: e.target.value })),
                rows: 15,
                className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500',
                required: true
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Featured Image URL'),
              React.createElement('input', {
                type: 'url',
                value: formData.featured_image,
                onChange: (e) => setFormData(prev => ({ ...prev, featured_image: e.target.value })),
                className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500'
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Meta Description'),
              React.createElement('textarea', {
                value: formData.meta_description,
                onChange: (e) => setFormData(prev => ({ ...prev, meta_description: e.target.value })),
                rows: 2,
                className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500',
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
                React.createElement('span', { className: 'text-sm font-medium text-gray-700' }, 'Published')
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
                className: 'px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
              }, 'Cancel'),
              React.createElement('button', {
                type: 'submit',
                className: 'px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700'
              }, editingPost ? 'Update Post' : 'Create Post')
            )
          )
        )
      )
    )
  );
}

export default AdminBlog;