"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { programs } from '@/data/programsData';
import Link from 'next/link';
import { ArrowLeft, Send, User, Phone, Mail, MapPin, GraduationCap, Briefcase, Calendar } from 'lucide-react';

const ApplyPage = () => {
  const params = useParams();
  const router = useRouter();
  const programId = Number(params.id);
  const program = programs.find(p => p.id === programId);
  
  const [formData, setFormData] = useState({
    fullName: '',
    countryCode: '+91',
    phoneNumber: '',
    email: '',
    city: '',
    country: 'India',
    qualification: '',
    experience: 0,
    organization: '',
    message: '',
    agreeToTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitStatus('success');
      setIsSubmitting(false);
    }, 1500);
  };

  if (!program) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Program not found</h2>
          <Link href="/#programs" className="text-red-600 hover:text-red-700 inline-flex items-center">
            <ArrowLeft className="inline mr-2" size={20} />
            Back to Programs
          </Link>
        </div>
      </div>
    );
  }

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying to {program.fullTitle || program.title}. 
            Our admissions team will review your application and contact you within 48 hours.
          </p>
          <div className="space-y-3">
            <Link 
              href={`/programs/${program.id}`}
              className="block w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Program Details
            </Link>
            <Link 
              href="/#programs"
              className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View All Programs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/programs/${program.id}`}
            className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Program Details
          </Link>
          
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Apply for {program.fullTitle || program.title}
                </h1>
                <p className="text-gray-600">
                  Start your journey in {program.title} Interior Design. Fill in your details and our team will reach out.
                </p>
              </div>
              <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                <p className="text-sm text-gray-600">Program Fee</p>
                <p className="text-xl font-bold text-red-600">{program.fee}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="inline mr-2" size={16} />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Phone with Country Code */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="inline mr-2" size={16} />
                  Country Code <span className="text-red-500">*</span>
                </label>
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  required
                >
                  <option value="+91">+91 (India)</option>
                  <option value="+1">+1 (USA)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (Australia)</option>
                  <option value="+971">+971 (UAE)</option>
                  <option value="+86">+86 (China)</option>
                  <option value="+81">+81 (Japan)</option>
                  <option value="+49">+49 (Germany)</option>
                  <option value="+33">+33 (France)</option>
                  <option value="+55">+55 (Brazil)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                 {/* <Phone className="inline mr-2" size={16}    /> */}
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter 10-digit number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  required
                  pattern="[0-9]{10}"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="inline mr-2" size={16} />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  required
                />
              </div>

              {/* City and Country */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="inline mr-2" size={16} />
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  required
                >
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Australia">Australia</option>
                  <option value="UAE">UAE</option>
                  <option value="China">China</option>
                  <option value="Japan">Japan</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Brazil">Brazil</option>
                </select>
              </div>

              {/* Qualification */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <GraduationCap className="inline mr-2" size={16} />
                  Highest Design Qualification <span className="text-red-500">*</span>
                </label>
                <select
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  required
                >
                  <option value="">Select your highest design qualification</option>
                  <option value="bachelor">Bachelor's in Design/Architecture</option>
                  <option value="master">Master's in Design/Architecture</option>
                  <option value="diploma">Diploma in Interior Design</option>
                  <option value="certificate">Certificate Course in Design</option>
                  <option value="none">No Interior Design Qualification</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="inline mr-2" size={16} />
                  Years of Work Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  max="50"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Briefcase className="inline mr-2" size={16} />
                  Current Organization
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Enter your current organization"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>

              {/* Message */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Tell us about your design interests, goals, or any specific questions..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
                />
              </div>
            </div>

            {/* Terms and Submit */}
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  required
                />
                <label className="text-sm text-gray-600">
                  I agree to receive program information, updates, and communications from the institute. 
                  I understand my data will be used in accordance with the privacy policy.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Application
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-500">
                By submitting this form, you agree to our terms and privacy policy. 
                We'll never share your information with third parties.
              </p>
            </div>
          </form>
        </div>

        {/* Program Quick Info */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Program Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Program</p>
              <p className="font-medium text-gray-900">{program.fullTitle || program.title}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="font-medium text-gray-900">{program.duration}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Mode</p>
              <p className="font-medium text-gray-900">{program.mode}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fee</p>
              <p className="font-medium text-red-600">{program.fee}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;