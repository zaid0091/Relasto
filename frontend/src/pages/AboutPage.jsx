import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, Phone, MapPin } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#FFF8F1] font-['Inter'] text-[#1A1A1A]">
      <Navbar />

      <main className="pt-20">

        <section className="relative py-24 px-6 md:px-16 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-[#FFF8F1] to-white -z-10" />
          <div className="absolute top-20 right-10 w-64 h-64 bg-[#F47D31]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#F47D31]/10 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-[#F47D31] font-bold text-sm tracking-widest uppercase mb-4 block">About Us</span>
                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                  Your Dream <br />
                  <span className="text-[#F47D31]">Home Starts</span> <br />
                  With Us
                </h1>
                <p className="text-gray-500 text-lg mb-8 max-w-lg">
                  Relasto connects property buyers with trusted agents to make real estate dreams come true. We believe in transparent, efficient, and accessible real estate for everyone.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/properties" className="bg-[#1A1A1A] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#333] transition-all text-center">
                    Browse Properties
                  </Link>
                  <Link to="/contact" className="bg-white border-2 border-gray-200 px-8 py-4 rounded-2xl font-bold hover:border-[#F47D31] hover:text-[#F47D31] transition-all text-center">
                    Contact Us
                  </Link>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000"
                  alt="Modern house"
                  className="rounded-[40px] shadow-2xl w-full"
                />
                <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl hidden sm:block">
                  <div className="text-4xl font-black text-[#F47D31]">10K+</div>
                  <div className="text-gray-500 font-bold">Happy Clients</div>
                </div>
              </div>
            </div>
          </div>
        </section>


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
                  <span className="text-white font-black text-xl">Since<br />2020</span>
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
    </div>
  );
};

export default AboutPage;