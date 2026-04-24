import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

const ContactPage = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1] font-['Inter']">
      <Navbar variant="light" />

      <main className="max-w-7xl mx-auto px-6 py-20 pt-28">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-5xl font-black text-[#1A1A1A] mb-8 tracking-tight">Get in touch</h1>
          <p className="text-gray-500 font-medium leading-relaxed text-lg">
            On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble.
          </p>
        </div>

        <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="p-10 lg:p-16 border-r border-gray-50">
              <h2 className="text-2xl font-black text-[#1A1A1A] mb-10 tracking-tight">Send a message</h2>

              {success && (
                <div className="mb-8 p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl font-bold text-sm flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  Message sent successfully!
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full h-16 pl-16 pr-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#F47D31] font-medium text-gray-700 placeholder:text-gray-400 transition-all"
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full h-16 pl-16 pr-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#F47D31] font-medium text-gray-700 placeholder:text-gray-400 transition-all"
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full h-16 pl-16 pr-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#F47D31] font-medium text-gray-700 placeholder:text-gray-400 transition-all"
                  />
                </div>

                <textarea
                  name="message"
                  placeholder="Message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full p-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#F47D31] font-medium text-gray-700 placeholder:text-gray-400 transition-all resize-none"
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-16 bg-[#1A1A1A] text-white rounded-2xl font-black text-sm hover:bg-[#F47D31] transition-all shadow-lg shadow-black/5 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="p-10 lg:p-16 bg-gray-50/30">
              <div className="mb-12">
                <h3 className="text-xl font-black text-[#1A1A1A] mb-6">Office Address</h3>
                <p className="text-gray-500 font-bold mb-8 leading-relaxed">
                  1421 San Pedro St, Los Angeles,<br />CA 90015
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-gray-500 font-bold group cursor-pointer">
                    <div className="w-10 h-10 bg-[#F47D31]/10 rounded-xl flex items-center justify-center group-hover:bg-[#F47D31] transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#F47D31] group-hover:text-white"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </div>
                    <span className="group-hover:text-[#1A1A1A] transition-colors">(123) 456-7890</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500 font-bold group cursor-pointer">
                    <div className="w-10 h-10 bg-[#F47D31]/10 rounded-xl flex items-center justify-center group-hover:bg-[#F47D31] transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#F47D31] group-hover:text-white"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    </div>
                    <span className="group-hover:text-[#1A1A1A] transition-colors">info@mail.com</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#1A1A1A] mb-8">Social</h3>
                <div className="flex flex-wrap gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 hover:border-[#F47D31] hover:bg-[#F47D31]/5 transition-all cursor-pointer group shadow-sm">
                      <div className="w-6 h-6 bg-gray-200 group-hover:bg-[#F47D31] transition-colors rounded-sm" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white pt-24 pb-12 mt-20 border-t border-[#F47D31]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-[#F47D31] rounded-xl flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <span className="text-2xl font-black text-[#1A1A1A] tracking-tight">Relasto</span>
              </Link>
              <p className="text-gray-500 font-medium mb-8 max-w-sm leading-relaxed">
                59 Bervely Hill Ave, Brooklyn Town,<br />New York, NY 5630, CA, US
              </p>
              <div className="space-y-3 mb-8">
                <p className="text-[#1A1A1A] font-bold">+(123) 456-7890</p>
                <p className="text-[#1A1A1A] font-bold">info@mail.com</p>
              </div>
              <div className="flex gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-[#F47D31]/10 transition-colors cursor-pointer group">
                    <div className="w-5 h-5 bg-gray-300 group-hover:bg-[#F47D31] transition-colors rounded-sm" />
                  </div>
                ))}
              </div>
            </div>

            {[
              { title: 'Features', links: ['Home v1', 'Home v2', 'About', 'Contact', 'Search'] },
              { title: 'Information', links: ['Listing v1', 'Listing v2', 'Property Details', 'Agent List', 'Agent Profile'] },
              { title: 'Documentation', links: ['Blog', 'FAQ', 'Privacy Policy', 'License'] }
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[#1A1A1A] font-black mb-8 uppercase tracking-widest text-xs">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-500 hover:text-[#F47D31] font-bold text-sm transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-12 border-t border-gray-100 flex flex-col md:row items-center justify-between gap-6">
            <p className="text-gray-400 font-bold text-sm">© 2022. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;