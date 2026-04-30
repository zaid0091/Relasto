import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

const BLOG_POSTS = [
  {
    id: 1,
    title: '10 Delightful Dining Room Decor Trends for Spring',
    category: 'Business',
    date: 'July 20, 2022',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=600&fit=crop',
    author: { name: 'Kristin Watson', role: 'Co-Founder and COO', avatar: 'KW' },
    excerpt: 'Discover the latest trends in dining room decor that will transform your space this spring.',
  },
  {
    id: 2,
    title: 'Transform Your Living Space with Modern Interior Ideas',
    category: 'Design',
    date: 'Aug 15, 2022',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=600&fit=crop',
    author: { name: 'Kristin Watson', role: 'Co-Founder and COO', avatar: 'KW' },
    excerpt: 'Modern interior design tips to bring elegance and comfort to your living areas.',
  },
  {
    id: 3,
    title: 'The Ultimate Guide to Buying Your First Home in 2024',
    category: 'Business',
    date: 'Sep 10, 2022',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=600&fit=crop',
    author: { name: 'Kristin Watson', role: 'Co-Founder and COO', avatar: 'KW' },
    excerpt: 'Everything you need to know about purchasing your first property in today\'s market.',
  },
  {
    id: 4,
    title: 'How to Stage Your Home for a Quick and Profitable Sale',
    category: 'Marketing',
    date: 'Oct 5, 2022',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&h=600&fit=crop',
    author: { name: 'Kristin Watson', role: 'Co-Founder and COO', avatar: 'KW' },
    excerpt: 'Professional staging techniques to maximize your home\'s appeal to potential buyers.',
  },
  {
    id: 5,
    title: 'Smart Home Technology Trends Reshaping Real Estate',
    category: 'Technology',
    date: 'Nov 12, 2022',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=1200&h=600&fit=crop',
    author: { name: 'Kristin Watson', role: 'Co-Founder and COO', avatar: 'KW' },
    excerpt: 'Explore how smart technology is revolutionizing modern homes and property values.',
  },
  {
    id: 6,
    title: 'Sustainable Living: Eco-Friendly Homes on the Rise',
    category: 'Lifestyle',
    date: 'Dec 1, 2022',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=600&fit=crop',
    author: { name: 'Kristin Watson', role: 'Co-Founder and COO', avatar: 'KW' },
    excerpt: 'Green living trends and eco-friendly features buyers are looking for in 2024.',
  },
  {
    id: 7,
    title: 'Understanding Property Taxes: A Complete Breakdown',
    category: 'Business',
    date: 'Jan 8, 2023',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=600&fit=crop',
    author: { name: 'Kristin Watson', role: 'Co-Founder and COO', avatar: 'KW' },
    excerpt: 'A comprehensive guide to understanding property taxes and how they affect your investment.',
  },
  {
    id: 8,
    title: 'Minimalist Kitchen Designs That Maximize Space',
    category: 'Design',
    date: 'Feb 14, 2023',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=600&fit=crop',
    author: { name: 'Kristin Watson', role: 'Co-Founder and COO', avatar: 'KW' },
    excerpt: 'Clever design solutions for creating spacious, functional minimalist kitchens.',
  },
  {
    id: 9,
    title: 'Real Estate Investment Tips for First-Time Buyers',
    category: 'Business',
    date: 'Mar 22, 2023',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=1200&h=600&fit=crop',
    author: { name: 'Kristin Watson', role: 'Co-Founder and COO', avatar: 'KW' },
    excerpt: 'Expert advice for beginners looking to make their first real estate investment.',
  },
];

const TABLE_DATA = [
  { name: 'Zakir Hossen', title: 'UI, UX Designer', email: 'codedesigner@gmail.com', phone: '+88 222 5554 444' },
  { name: 'Sarah Johnson', title: 'Frontend Developer', email: 'sarah.j@relasto.com', phone: '+88 222 5554 445' },
  { name: 'Michael Chen', title: 'Product Manager', email: 'm.chen@relasto.com', phone: '+88 222 5554 446' },
  { name: 'Emma Davis', title: 'Marketing Lead', email: 'emma.d@relasto.com', phone: '+88 222 5554 447' },
  { name: 'James Wilson', title: 'Backend Engineer', email: 'james.w@relasto.com', phone: '+88 222 5554 448' },
];

const BlogDetailPage = () => {
  const { id } = useParams();
  const post = BLOG_POSTS.find((p) => p.id === parseInt(id));
  const recentPosts = BLOG_POSTS.filter((p) => p.id !== parseInt(id)).slice(0, 3);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FFF8F1] font-['Inter'] text-[#1A1A1A]">
        <Navbar />
        <div className="pt-32 text-center px-4">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-12 max-w-md mx-auto">
            <div className="text-6xl mb-4">📰</div>
            <h1 className="text-2xl font-black text-[#1A1A1A] mb-2">Article Not Found</h1>
            <p className="text-gray-400 mb-6">The blog post you're looking for doesn't exist.</p>
            <Link to="/blog" className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#333] transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F1] font-['Inter'] text-[#1A1A1A]">
      <Navbar />

      {/* Back Navigation */}
      <div className="pt-28 pb-4 px-4 sm:px-6 lg:px-16 max-w-[1440px] mx-auto">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#F47D31] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
          Back to Articles
        </Link>
      </div>

      <main className="px-4 sm:px-6 lg:px-16 max-w-[1440px] mx-auto pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Article Card */}
            <article className="bg-[#FDF8F5] rounded-[32px] border border-orange-200 shadow-sm overflow-hidden">
              {/* Hero Image */}
              <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {/* Category Badge */}
                <div className="absolute top-6 left-6">
                  <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold shadow-sm text-[#1A1A1A]">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 sm:p-10 lg:p-12">
                {/* Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A1A1A] leading-tight mb-6">
                  {post.title}
                </h1>

                {/* Author & Meta */}
                <div className="flex flex-wrap items-center gap-4 mb-10 pb-10 border-b border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white font-bold text-sm">
                      {post.author.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1A1A1A]">{post.author.name}</h4>
                      <p className="text-sm text-gray-500">{post.author.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 ml-auto">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#F47D31]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#F47D31]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 8 14" />
                      </svg>
                      {post.readTime}
                    </span>
                  </div>
                </div>

                {/* Article Body */}
                <div className="prose-content space-y-8">
                  {/* Intro */}
                  <p className="text-lg text-[#5D7285] leading-relaxed">
                    Have you ever wondered why a lot of things are coming back, bringing back nostalgia. Wondering why I am talking about nostalgia and if it appears to be an article on website trend, because some not famous website technology is coming back too. Yes, I am talking about static websites.
                  </p>
                  <p className="text-lg text-[#5D7285] leading-relaxed">
                    Long ago, almost all websites were used to be static, issues during the early days of the internet. Then dynamic sites came and took the space. A lot of websites shifted to it. Obviously dynamic sites have their advantages. But static sites are making a comeback. And it's coming stronger than before.
                  </p>

                  {/* Blockquotes */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 border-l-4 border-[#F47D31] shadow-sm">
                      <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Performance: Faster Loading Speed</h3>
                      <p className="text-[#5D7285] leading-relaxed">
                        Static websites are way faster than dynamic ones. As they don't have a back-end system, there is no time issue to database connection. Instead, the lightweight, pre-rendered HTML files load incredibly fast.
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 sm:p-8 border-l-4 border-gray-300 shadow-sm">
                      <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Security: A More Secure Website</h3>
                      <p className="text-[#5D7285] leading-relaxed">
                        Static websites have fewer vulnerabilities since there's no database to hack and no server-side code to exploit. This makes them inherently more secure than dynamic alternatives.
                      </p>
                    </div>
                  </div>

                  {/* Images Grid */}
                  <div>
                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Visual Examples</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <img
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop"
                        alt="Property"
                        className="w-full h-56 object-cover rounded-2xl shadow-sm"
                      />
                      <img
                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop"
                        alt="Property"
                        className="w-full h-56 object-cover rounded-2xl shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Lists */}
                  <div>
                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Key Advantages</h2>
                    <ul className="space-y-3">
                      {[
                        'Performance: Faster Loading Speed',
                        'Less Server-side Dependencies',
                        'Flexibility: More Freedom to Develop Websites',
                        'Security: A More Secure Website',
                        'Scalability: Capability to Handle Massive Traffic',
                        'Hosting and Pricing: Saves Your Budget For Good',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-[#5D7285]">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-[#F47D31] flex-shrink-0"></span>
                          <span className="font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Links */}
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Related Resources</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Blog sites', 'Small Business', 'Development', 'Portfolio', 'Documentation'].map((tag) => (
                        <span key={tag} className="px-4 py-2 bg-[#FFF8F1] rounded-full text-sm font-semibold text-[#1A1A1A] hover:bg-[#F47D31]/10 transition-colors cursor-pointer">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Table */}
                  <div>
                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Team Members</h2>
                    <div className="overflow-x-auto rounded-2xl border border-orange-200 bg-white shadow-sm">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#FFF8F1] border-b border-orange-200">
                            <th className="text-left px-6 py-4 font-bold text-[#1A1A1A]">Full Name</th>
                            <th className="text-left px-6 py-4 font-bold text-[#1A1A1A]">Title</th>
                            <th className="text-left px-6 py-4 font-bold text-[#1A1A1A] hidden sm:table-cell">Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {TABLE_DATA.slice(0, 4).map((row, i) => (
                            <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-[#FFF8F1]/50 transition-colors">
                              <td className="px-6 py-4 font-semibold text-[#1A1A1A]">{row.name}</td>
                              <td className="px-6 py-4 text-[#5D7285]">{row.title}</td>
                              <td className="px-6 py-4 text-[#5D7285] hidden sm:table-cell">{row.email}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Share Section */}
                <div className="mt-12 pt-8 border-t border-orange-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Share this article</p>
                      <div className="flex items-center gap-3">
                        {['twitter', 'facebook', 'linkedin', 'link'].map((social) => (
                          <button
                            key={social}
                            className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#F47D31] hover:text-[#F47D31] transition-all shadow-sm"
                          >
                            {social === 'twitter' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>}
                            {social === 'facebook' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>}
                            {social === 'linkedin' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>}
                            {social === 'link' && <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-[#333] transition-all shadow-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                      Save Article
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Author Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">About the Author</p>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white font-bold text-xl">
                  {post.author.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-[#1A1A1A] text-lg">{post.author.name}</h4>
                  <p className="text-sm text-[#F47D31] font-semibold">{post.author.role}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Experienced professional with over 10 years in the real estate industry, helping clients find their dream homes.
              </p>
              <button className="w-full py-3 border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-xl font-bold hover:bg-[#1A1A1A] hover:text-white transition-all">
                View Profile
              </button>
            </div>

            {/* Related Categories */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Categories</p>
              <div className="flex flex-wrap gap-2">
                {['Business', 'Design', 'Marketing', 'Technology', 'Lifestyle'].map((cat) => (
                  <Link
                    key={cat}
                    to={`/blog?category=${cat}`}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      cat === post.category
                        ? 'bg-[#1A1A1A] text-white'
                        : 'bg-[#FFF8F1] text-[#1A1A1A] hover:bg-[#F47D31]/10'
                    }`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-[#1A1A1A] rounded-2xl p-6 text-white">
              <h4 className="font-bold text-lg mb-2">Stay Updated</h4>
              <p className="text-sm text-gray-300 mb-4">Get the latest real estate news delivered to your inbox.</p>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm mb-3 outline-none focus:border-[#F47D31]"
              />
              <button className="w-full py-3 bg-[#F47D31] text-white rounded-xl font-bold hover:bg-[#e06b20] transition-all">
                Subscribe
              </button>
            </div>
          </aside>
        </div>

        {/* Recent News Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#1A1A1A]">More Articles</h2>
            <Link to="/blog" className="flex items-center gap-2 text-sm font-bold text-[#F47D31] hover:underline">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {recentPosts.map((rp) => (
              <RecentPostCard key={rp.id} post={rp} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

/* Recent Post Card Component */
const RecentPostCard = ({ post }) => {
  return (
    <article className="bg-[#FDF8F5] rounded-[15px] overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-orange-200 w-full">
      <div className="relative h-48 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm text-[#1A1A1A]">
          {post.category}
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-bold text-lg leading-tight text-[#1A1A1A] line-clamp-2 mb-3 group-hover:text-[#F47D31] transition-colors">
          {post.title}
        </h3>

        <p className="text-[#5D7285] text-sm leading-relaxed mb-4 line-clamp-2">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-semibold">{post.readTime}</span>
          <Link
            to={`/blog/${post.id}`}
            className="text-sm font-bold text-[#1A1A1A] hover:text-[#F47D31] transition-colors flex items-center gap-1"
          >
            Read More
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogDetailPage;
