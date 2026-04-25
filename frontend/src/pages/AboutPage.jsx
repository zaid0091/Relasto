import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, Phone, MapPin } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#FFF8F1] font-['Inter'] text-[#1A1A1A]">
      <Navbar variant="light" />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-24 px-6 md:px-16 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-[#FFF8F1] to-white -z-10" />
          <div className="absolute top-20 right-10 w-64 h-64 bg-[#F47D31]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#F47D31]/10 rounded-full blur-3xl" />
          
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-[#F47D31] font-bold text-sm tracking-widest uppercase mb-4 block">About Us</span>
                <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                  Your Dream <br />
                  <span className="text-[#F47D31]">Home Starts</span> <br />
                  With Us
                </h1>
                <p className="text-gray-500 text-lg mb-8 max-w-lg">
                  Relasto connects property buyers with trusted agents to make real estate dreams come true. We believe in transparent, efficient, and accessible real estate for everyone.
                </p>
                <div className="flex gap-4">
                  <Link to="/properties" className="bg-[#1A1A1A] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#333] transition-all">
                    Browse Properties
                  </Link>
                  <Link to="/contact" className="bg-white border-2 border-gray-200 px-8 py-4 rounded-2xl font-bold hover:border-[#F47D31] hover:text-[#F47D31] transition-all">
                    Contact Us
                  </Link>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000" 
                  alt="Modern house" 
                  className="rounded-[40px] shadow-2xl"
                />
                <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl">
                  <div className="text-4xl font-black text-[#F47D31]">10K+</div>
                  <div className="text-gray-500 font-bold">Happy Clients</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6 md:px-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '500+', label: 'Properties' },
                { value: '100+', label: 'Expert Agents' },
                { value: '10K+', label: 'Happy Clients' },
                { value: '50+', label: 'Cities Covered' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-8">
                  <div className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-2">{stat.value}</div>
                  <div className="text-gray-400 font-bold uppercase tracking-wider text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-24 px-6 md:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000" 
                  alt="Team working" 
                  className="rounded-[40px] shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#F47D31] rounded-3xl flex items-center justify-center">
                  <span className="text-white font-black text-xl">Since<br/>2020</span>
                </div>
              </div>
              <div>
                <span className="text-[#F47D31] font-bold text-sm tracking-widest uppercase mb-4 block">Our Mission</span>
                <h2 className="text-4xl font-black mb-6">Making Real Estate Simple & Accessible</h2>
                <p className="text-gray-500 text-lg mb-6">
                  Relasto was founded with a simple mission: to make real estate transactions transparent, efficient, and accessible to everyone. We believe that finding your dream property or connecting with qualified buyers should be a seamless experience.
                </p>
                <p className="text-gray-500 text-lg mb-8">
                  Our platform connects buyers directly with verified agents, eliminating intermediaries and ensuring that every transaction is handled by professionals who understand the local market.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: '✓', text: 'Verified Agents' },
                    { icon: '✓', text: 'Transparent Process' },
                    { icon: '✓', text: 'Wide Selection' },
                    { icon: '✓', text: 'Easy Scheduling' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[#F47D31] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {item.icon}
                      </div>
                      <span className="font-bold text-gray-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-6 md:px-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#F47D31] font-bold text-sm tracking-widest uppercase mb-4 block">How It Works</span>
              <h2 className="text-4xl font-black">Find Your Home in 3 Steps</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Search Properties', desc: 'Browse our extensive listings using advanced filters to find properties that match your criteria.' },
                { step: '02', title: 'Connect with Agents', desc: 'View agent profiles, read reviews, and find the perfect professional to help with your transaction.' },
                { step: '03', title: 'Schedule Visits', desc: 'Request property visits directly through our platform and get in touch with agents instantly.' },
              ].map((item, i) => (
                <div key={i} className="relative p-10 bg-[#FFF8F1] rounded-[40px] group hover:shadow-xl transition-all">
                  <div className="text-6xl font-black text-[#F47D31]/20 mb-4">{item.step}</div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 px-6 md:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#F47D31] font-bold text-sm tracking-widest uppercase mb-4 block">Our Values</span>
              <h2 className="text-4xl font-black">What We Stand For</h2>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: '🎯', title: 'Trust', desc: 'We verify every agent and ensure transparency in all transactions.' },
                { icon: '💎', title: 'Quality', desc: 'Every property listing meets our high standards for accuracy.' },
                { icon: '🌍', title: 'Accessibility', desc: 'Our platform is designed to be user-friendly for everyone.' },
                { icon: '💡', title: 'Innovation', desc: 'We continuously improve our technology to serve you better.' },
              ].map((item, i) => (
                <div key={i} className="text-center p-8 bg-white rounded-[40px] shadow-sm hover:shadow-xl transition-all">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 md:px-16 bg-[#1A1A1A]">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Ready to Find Your Dream Home?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of happy clients who found their perfect property with Relasto. Start your search today!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/properties" className="bg-[#F47D31] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#e06d25] transition-all">
                Browse Properties
              </Link>
              <Link to="/agents" className="bg-white text-[#1A1A1A] px-10 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all">
                Meet Our Agents
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-[#F47D31] rounded-xl flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <span className="text-2xl font-black text-[#1A1A1A]">Relasto</span>
              </div>
              <p className="text-gray-500 font-medium">
                Connecting property buyers with trusted agents to make real estate dreams come true.
              </p>
            </div>
            <div>
              <h4 className="font-black text-lg mb-6">Quick Links</h4>
              <div className="space-y-4">
                <Link to="/properties" className="block text-gray-500 font-bold hover:text-[#F47D31]">Properties</Link>
                <Link to="/agents" className="block text-gray-500 font-bold hover:text-[#F47D31]">Agents</Link>
                <Link to="/about" className="block text-gray-500 font-bold hover:text-[#F47D31]">About</Link>
                <Link to="/contact" className="block text-gray-500 font-bold hover:text-[#F47D31]">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="font-black text-lg mb-6">Contact</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-500 font-bold">
                  <Phone className="w-4 h-4 text-[#F47D31]" />
                  (123) 456-7890
                </div>
                <div className="flex items-center gap-3 text-gray-500 font-bold">
                  <Mail className="w-4 h-4 text-[#F47D31]" />
                  info@relasto.com
                </div>
                <div className="flex items-center gap-3 text-gray-500 font-bold">
                  <MapPin className="w-4 h-4 text-[#F47D31]" />
                  Los Angeles, CA
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-black text-lg mb-6">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-[#FFF8F1] rounded-full flex items-center justify-center hover:bg-[#F47D31] hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-[#FFF8F1] rounded-full flex items-center justify-center hover:bg-[#F47D31] hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.672L7.324 2.845H5.165z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-[#FFF8F1] rounded-full flex items-center justify-center hover:bg-[#F47D31] hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 8.69 8.878 8.878 1.261.058 1.648.07 4.848.07 3.259 0 3.668-.014 4.949-.072 4.354-.2 8.687-2.617 8.879-8.878.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-8.687-8.878-8.879-1.28-.058-1.689-.072-4.949-.072zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-[#FFF8F1] rounded-full flex items-center justify-center hover:bg-[#F47D31] hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.159 4.267 4.97v5.928zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-400 font-bold">© 2026 Relasto. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;