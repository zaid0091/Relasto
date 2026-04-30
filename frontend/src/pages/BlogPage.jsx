import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'Business', label: 'Business' },
  { value: 'Design', label: 'Design' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Lifestyle', label: 'Lifestyle' },
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
];

const BLOG_POSTS = [
  {
    id: 1,
    title: '10 Delightful Dining Room Decor Trends for Spring',
    category: 'Business',
    date: 'July 20, 2022',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop',
    excerpt: 'Discover the latest trends in dining room decor that will transform your space this spring.',
  },
  {
    id: 2,
    title: 'Transform Your Living Space with Modern Interior Ideas',
    category: 'Design',
    date: 'Aug 15, 2022',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
    excerpt: 'Modern interior design tips to bring elegance and comfort to your living areas.',
  },
  {
    id: 3,
    title: 'The Ultimate Guide to Buying Your First Home in 2024',
    category: 'Business',
    date: 'Sep 10, 2022',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
    excerpt: 'Everything you need to know about purchasing your first property in today\'s market.',
  },
  {
    id: 4,
    title: 'How to Stage Your Home for a Quick and Profitable Sale',
    category: 'Marketing',
    date: 'Oct 5, 2022',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&h=400&fit=crop',
    excerpt: 'Professional staging techniques to maximize your home\'s appeal to potential buyers.',
  },
  {
    id: 5,
    title: 'Smart Home Technology Trends Reshaping Real Estate',
    category: 'Technology',
    date: 'Nov 12, 2022',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=600&h=400&fit=crop',
    excerpt: 'Explore how smart technology is revolutionizing modern homes and property values.',
  },
  {
    id: 6,
    title: 'Sustainable Living: Eco-Friendly Homes on the Rise',
    category: 'Lifestyle',
    date: 'Dec 1, 2022',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop',
    excerpt: 'Green living trends and eco-friendly features buyers are looking for in 2024.',
  },
  {
    id: 7,
    title: 'Understanding Property Taxes: A Complete Breakdown',
    category: 'Business',
    date: 'Jan 8, 2023',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop',
    excerpt: 'A comprehensive guide to understanding property taxes and how they affect your investment.',
  },
  {
    id: 8,
    title: 'Minimalist Kitchen Designs That Maximize Space',
    category: 'Design',
    date: 'Feb 14, 2023',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop',
    excerpt: 'Clever design solutions for creating spacious, functional minimalist kitchens.',
  },
  {
    id: 9,
    title: 'Real Estate Investment Tips for First-Time Buyers',
    category: 'Business',
    date: 'Mar 22, 2023',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=600&h=400&fit=crop',
    excerpt: 'Expert advice for beginners looking to make their first real estate investment.',
  },
];

const POSTS_PER_PAGE = 9;

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter posts
  let filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort posts
  filteredPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'oldest') {
      return new Date(a.date) - new Date(b.date);
    }
    return 0; // popular - keep original order
  });

  const totalPosts = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const activeFilterCount = (searchQuery ? 1 : 0) + (selectedCategory ? 1 : 0);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('popular');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1] font-['Inter'] text-[#1A1A1A]">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 md:px-16 max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Real Estate News & Blogs</h1>
            <p className="text-gray-400 font-medium mt-2 text-sm">
              Showing <span className="text-[#1A1A1A] font-bold">{paginatedPosts.length}</span> of{' '}
              <span className="text-[#1A1A1A] font-bold">{totalPosts}</span> articles
            </p>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort</span>
            <select
              className="px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm font-semibold outline-none cursor-pointer hover:border-[#F47D31]/40 transition-colors shadow-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-3 md:p-2.5 rounded-2xl shadow-xl flex flex-col lg:flex-row items-stretch gap-2 mb-6 border border-gray-100">
          {/* Search input */}
          <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input
              type="text"
              placeholder="Search articles by title..."
              className="bg-transparent outline-none flex-1 text-sm font-medium min-w-0"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:flex items-center gap-2">
            <select
              className="w-full lg:w-auto px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            >
              {CATEGORIES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Search button */}
            <button
              onClick={() => setCurrentPage(1)}
              className="col-span-2 sm:col-span-1 bg-[#1A1A1A] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#333] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.97]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              Search
            </button>
          </div>
        </div>

        {/* Active Filter Tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {searchQuery && (
              <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm hover:border-[#F47D31]/30 transition-all">
                <span className="text-gray-400 font-medium">Search:</span>
                <span className="text-[#1A1A1A] max-w-[120px] truncate">{searchQuery}</span>
                <button onClick={() => { setSearchQuery(''); setCurrentPage(1); }} className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all">×</button>
              </div>
            )}
            {selectedCategory && (
              <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm hover:border-[#F47D31]/30 transition-all">
                <span className="text-gray-400 font-medium">Category:</span>
                <span className="text-[#1A1A1A]">{selectedCategory}</span>
                <button onClick={() => { setSelectedCategory(''); setCurrentPage(1); }} className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all">×</button>
              </div>
            )}
            <button onClick={clearFilters} className="text-xs font-bold text-[#F47D31] hover:underline ml-2">Clear all</button>
          </div>
        )}

        {/* Blog Grid */}
        {paginatedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {paginatedPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm px-6">
            <div className="text-6xl mb-6">📰</div>
            <h3 className="text-2xl font-black mb-3">No articles found</h3>
            <p className="text-gray-400 max-w-xs mx-auto text-sm font-medium leading-relaxed">
              We couldn't find any articles matching your search. Try adjusting your filters.
            </p>
            <button onClick={clearFilters} className="mt-8 text-[#F47D31] font-bold text-sm hover:underline">Clear all filters</button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Page {currentPage} of {totalPages} · {totalPosts} results
            </p>
            <div className="flex items-center gap-2">
              {/* Prev */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#F47D31]/30 hover:text-[#F47D31] transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
              </button>

              {/* Page numbers */}
              {getPageNumbers(currentPage, totalPages).map((p, i) =>
                p === '...' ? (
                  <span key={`dot-${i}`} className="w-8 text-center text-gray-400 text-sm font-bold">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${
                      currentPage === p
                        ? 'bg-[#1A1A1A] text-white shadow-xl scale-110'
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-[#F47D31]/30 hover:text-[#F47D31]'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

              {/* Next */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#F47D31]/30 hover:text-[#F47D31] transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

/* Sub-components */

const BlogCard = ({ post }) => {
  return (
    <article className="bg-[#FDF8F5] rounded-[15px] overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-orange-200 w-full">
      {/* Image */}
      <div className="relative h-60 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        {/* Category Badge */}
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold shadow-sm text-[#1A1A1A]">
          {post.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-8 md:p-10">
        {/* Title */}
        <div className="flex items-start gap-4 mb-6">
          <div className="mt-1 shrink-0">
            <svg className="w-7 h-7 text-[#1A1A1A]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 7h5v2h-5v-2zm-5 0h3v2H7v-2zm5 4h5v2h-5v-2zm-5 0h3v2H7v-2zm5 4h5v2h-5v-2zm-5 0h3v2H7v-2zm-3-8h12v2H4v-2z"/>
            </svg>
          </div>
          <h3 className="font-bold text-2xl leading-tight text-[#1A1A1A] line-clamp-2">{post.title}</h3>
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-8">
          <div className="flex items-center gap-3 text-[#5D7285] font-semibold">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-3 text-[#5D7285] font-semibold">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>{post.readTime}</span>
          </div>
        </div>

        {/* Excerpt */}
        <p className="text-[#5D7285] text-sm font-medium leading-relaxed mb-8 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Button */}
        <Link
          to={`/blog/${post.id}`}
          className="block w-full bg-[#1A1A1A] text-white text-center px-8 py-4 rounded-2xl text-base font-bold hover:bg-[#333] transition-all shadow-lg active:scale-95"
        >
          Read Article
        </Link>
      </div>
    </article>
  );
};

/* Smart page number generation */
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default BlogPage;
