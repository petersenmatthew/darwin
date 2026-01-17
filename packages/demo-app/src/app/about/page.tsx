'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePageTracking } from '../../hooks/usePageTracking';
import SectionTracker from '../../components/tracking/SectionTracker';

export default function AboutPage() {
  usePageTracking();
  const [hoveredTeamMember, setHoveredTeamMember] = useState<string | null>(null);

  const teamMembers = [
    { id: '1', name: 'Sarah Chen', role: 'CEO & Founder', image: 'https://placehold.co/200x200/e2e8f0/475569?text=SC' },
    { id: '2', name: 'Michael Rodriguez', role: 'CTO', image: 'https://placehold.co/200x200/e2e8f0/475569?text=MR' },
    { id: '3', name: 'Emily Thompson', role: 'Head of Design', image: 'https://placehold.co/200x200/e2e8f0/475569?text=ET' },
    { id: '4', name: 'David Kim', role: 'Head of Operations', image: 'https://placehold.co/200x200/e2e8f0/475569?text=DK' },
  ];

  const stats = [
    { label: 'Happy Customers', value: '50,000+' },
    { label: 'Products', value: '1,000+' },
    { label: 'Countries Shipped', value: '45+' },
    { label: 'Team Members', value: '120+' },
  ];

  const values = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Quality First',
      description: 'We carefully curate every product to ensure it meets our high standards for quality and durability.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Sustainability',
      description: 'We\'re committed to reducing our environmental impact through eco-friendly packaging and sustainable sourcing.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Customer Focus',
      description: 'Your satisfaction is our priority. We\'re here to help with any questions or concerns you may have.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Innovation',
      description: 'We continuously evolve and improve our products and services to meet your changing needs.',
    },
  ];

  const milestones = [
    { year: '2018', title: 'ShopWave Founded', description: 'Started in a small garage with a vision to make quality products accessible.' },
    { year: '2019', title: 'First 1,000 Customers', description: 'Reached our first major milestone and expanded our product line.' },
    { year: '2020', title: 'International Expansion', description: 'Started shipping to 20+ countries worldwide.' },
    { year: '2021', title: 'Sustainability Initiative', description: 'Launched our eco-friendly packaging program.' },
    { year: '2022', title: '50K Customers', description: 'Celebrated our 50,000th happy customer.' },
    { year: '2023', title: 'New Headquarters', description: 'Moved to our new San Francisco headquarters.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="text-sm mb-8">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900">About Us</li>
          </ol>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            We&apos;re on a mission to make quality products accessible to everyone.
            Founded in 2018, ShopWave has grown from a small startup to a trusted
            destination for thousands of customers worldwide.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b">
        <SectionTracker sectionId="stats_section" sectionName="Stats">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center group cursor-pointer"
                onMouseEnter={() => {}}
              >
                <div className="text-3xl md:text-4xl font-bold text-green-600 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        </SectionTracker>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <SectionTracker sectionId="mission_section" sectionName="Our Mission">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-gray-600 mb-4">
                  At ShopWave, we believe everyone deserves access to high-quality products
                  without breaking the bank. We work directly with manufacturers and artisans
                  to bring you carefully curated items that combine style, functionality, and value.
                </p>
                <p className="text-gray-600 mb-6">
                  Every product in our collection is selected with care, tested for quality,
                  and backed by our satisfaction guarantee. We&apos;re not just selling products –
                  we&apos;re building relationships with customers who trust us to deliver excellence.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Shop Our Collection
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center">
                <span className="text-gray-500">Mission Image</span>
              </div>
            </div>
          </div>
        </SectionTracker>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <SectionTracker sectionId="values_section" sectionName="Our Values">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-lg border hover:border-green-300 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionTracker>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <SectionTracker sectionId="timeline_section" sectionName="Our Journey">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-green-200"></div>

              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex items-center mb-8 ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
                      <span className="text-green-600 font-bold">{milestone.year}</span>
                      <h3 className="text-lg font-semibold mt-1">{milestone.title}</h3>
                      <p className="text-gray-600 text-sm mt-2">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-600 rounded-full border-4 border-white shadow"></div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </SectionTracker>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <SectionTracker sectionId="team_section" sectionName="Meet Our Team">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Meet Our Team</h2>
            <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
              The passionate people behind ShopWave who work hard every day to bring you the best shopping experience.
            </p>
            <div className="grid md:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="text-center group cursor-pointer"
                  onMouseEnter={() => setHoveredTeamMember(member.id)}
                  onMouseLeave={() => setHoveredTeamMember(null)}
                >
                  <div className={`relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden transition-transform ${
                    hoveredTeamMember === member.id ? 'scale-105' : ''
                  }`}>
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                    {hoveredTeamMember === member.id && (
                      <div className="absolute inset-0 bg-green-600 bg-opacity-20 flex items-center justify-center">
                        <div className="flex gap-2">
                          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                          </button>
                          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-gray-600 text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionTracker>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <SectionTracker sectionId="cta_section" sectionName="Call to Action">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
            <p className="text-green-100 mb-8">
              Join thousands of satisfied customers and discover quality products at great prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="px-8 py-3 bg-white text-green-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Browse Products
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-green-600 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </SectionTracker>
      </section>
    </div>
  );
}
