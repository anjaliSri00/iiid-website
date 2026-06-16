'use client';

import { useState } from 'react';
import { Gift, Clock, Users, Award } from 'lucide-react';

export default function ScholarshipSection() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Email submitted:', email);
    alert('Thank you! We will contact you about scholarship opportunities.');
    setEmail('');
  };

  return (
    <section className="py-16 bg-linear-to-r from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-8 h-8 text-red-600" />
              <span className="text-red-600 font-semibold">Limited Time Offer</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Early Bird Scholarship
            </h2>
            <p className="text-gray-600 mb-6">
              Apply before March 10, 2024 and get:
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-700">20% discount on course fee</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-700">Free e-book on Interior Design</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-700">1-on-1 career counseling session</span>
              </li>
            </ul>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
              />

              <button
                type="submit"
                className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition font-semibold whitespace-nowrap"
              >
                Claim Scholarship
              </button>
            </form>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg text-center shadow-sm">
              <Clock className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">10+</p>
              <p className="text-gray-600 text-sm">Years Experience</p>
            </div>
            <div className="bg-white p-6 rounded-lg text-center shadow-sm">
              <Users className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">5000+</p>
              <p className="text-gray-600 text-sm">Students Certified</p>
            </div>
            <div className="bg-white p-6 rounded-lg text-center shadow-sm">
              <Award className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">30+</p>
              <p className="text-gray-600 text-sm">Countries</p>
            </div>
            <div className="bg-white p-6 rounded-lg text-center shadow-sm">
              <Gift className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">20%</p>
              <p className="text-gray-600 text-sm">Scholarship</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}