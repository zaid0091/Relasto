import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import emailjs from '@emailjs/browser';
import { Mail, Phone } from 'lucide-react';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

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
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    
    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone,
        message: formData.message,
      }, PUBLIC_KEY);
      
      setSubmitting(false);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('EmailJS error:', err);
      setSubmitting(false);
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1] font-['Inter']">
      <Navbar variant="light" />

      <main className="max-w-7xl mx-auto px-6 md:px-16 py-20 pt-28">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-8 tracking-tight">Get in touch</h1>
          <p className="text-gray-500 font-medium leading-relaxed text-lg">
            On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble.
          </p>
        </div>

        <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
  
            <div className="p-6 md:p-16 border-r border-gray-50">
              <h2 className="text-2xl font-black text-[#1A1A1A] mb-10 tracking-tight">Send a message</h2>

              {success && (
                <div className="mb-8 p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl font-bold text-sm flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  Message sent successfully!
                </div>
              )}

              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-bold text-sm flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  Failed to send message. Please try again.
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

        
            <div className="p-6 md:p-16 bg-gray-50/30">
              <div className="mb-12">
                <h3 className="text-xl font-black text-[#1A1A1A] mb-6">Office Address</h3>
                <p className="text-gray-500 font-bold mb-8 leading-relaxed">
                  1421 San Pedro St, Los Angeles,<br />CA 90015
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-gray-500 font-bold group cursor-pointer">
                    <div className="w-10 h-10 bg-[#F47D31]/10 rounded-xl flex items-center justify-center group-hover:bg-[#F47D31] transition-colors">
                      <Phone className="w-4 h-4 text-[#F47D31] group-hover:text-white" />
                    </div>
                    <span className="group-hover:text-[#1A1A1A] transition-colors">(123) 456-7890</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500 font-bold group cursor-pointer">
                    <div className="w-10 h-10 bg-[#F47D31]/10 rounded-xl flex items-center justify-center group-hover:bg-[#F47D31] transition-colors">
                      <Mail className="w-4 h-4 text-[#F47D31] group-hover:text-white" />
                    </div>
                    <span className="group-hover:text-[#1A1A1A] transition-colors">info@mail.com</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#1A1A1A] mb-8">Social</h3>
                <div className="flex flex-wrap gap-4">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 hover:border-[#F47D31] hover:bg-[#F47D31]/5 transition-all cursor-pointer group shadow-sm">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-[#F47D31] transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 hover:border-[#F47D31] hover:bg-[#F47D31]/5 transition-all cursor-pointer group shadow-sm">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-[#F47D31] transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.672L7.324 2.845H5.165z"/></svg>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 hover:border-[#F47D31] hover:bg-[#F47D31]/5 transition-all cursor-pointer group shadow-sm">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-[#F47D31] transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 8.69 8.878 8.878 1.261.058 1.648.07 4.848.07 3.259 0 3.668-.014 4.949-.072 4.354-.2 8.687-2.617 8.879-8.878.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-8.687-8.878-8.879-1.28-.058-1.689-.072-4.949-.072zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 hover:border-[#F47D31] hover:bg-[#F47D31]/5 transition-all cursor-pointer group shadow-sm">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-[#F47D31] transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.159 4.267 4.97v5.928zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 hover:border-[#F47D31] hover:bg-[#F47D31]/5 transition-all cursor-pointer group shadow-sm">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-[#F47D31] transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.156a2.555 2.555 0 0 0-1.795-1.792c-.55-.133-2.198-.199-4.882-.199-2.678 0-4.33.066-4.877.199a2.555 2.555 0 0 0-1.792 1.792A23.685 23.685 0 0 0 6.158 12a23.681 23.681 0 0 0 .104 2.044 2.54 2.54 0 0 0 .728 1.466c.39.437.867.688 1.384.792.55.133 2.2.199 4.882.199 2.678 0 4.33-.066 4.877-.199.517-.104.994-.355 1.384-.792.39-.437.64-.914.728-1.466A23.681 23.681 0 0 0 24 12c0-1.125-.078-2.153-.104-2.844-.026-.551-.103-1.018-.398-1.54zm-12.663 9.703V8.27l6.332 3.294-6.332 3.295z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;