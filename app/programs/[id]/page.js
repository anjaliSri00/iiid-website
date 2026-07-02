"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  Loader2, 
  Award,
  GraduationCap,
  TrendingDown,
  CheckCircle,
  Video,
  FileText,
  Play,
  Download,
  Star,
  Users
} from 'lucide-react';
import fetchApiResponse from '@/helper/api_data_store';
import { useRouter } from 'next/navigation';


const ProgramDetailPage = () => {
  const params = useParams();
  const { data: session } = useSession();
  const programId = params.id;
  const router = useRouter();

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (programId) {
      fetchProgramDetails();
    }
  }, [programId]);

  const fetchProgramDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/details/${programId}`,
        {
          method: "GET",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        }
      );

      if (response.meta?.status === 200 && response.data) {
        const course = response.data;
        // Transform the data
        const formattedProgram = {
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          duration: course.duration,
          mode: course.mode || 'Online',
          level: course.level,
          original_price: course.original_price,
          discount: course.discount,
          final_price: course.final_price,
          fee: `₹${course.final_price || course.original_price}`,
          thumbnail_url: course.thumbnail_url,
          status: course.status,
          course_code: course.course_code,
          lessons: course.lessons || [],
          created_at: course.created_at,
          updated_at: course.updated_at,
          instructor_id: course.instructor_id,
          is_active: course.is_active,
          assessment: getAssessmentForCategory(course.category),
        };
        setProgram(formattedProgram);
      } else {
        setError(response.meta?.message || "Failed to fetch program details");
      }
    } catch (error) {
      console.error("Error fetching program details:", error);
      setError("Failed to load program details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get assessment based on category
  const getAssessmentForCategory = (category) => {
    const assessments = {
      'Web Development': ['Project-Based Assessment', 'Technical Interview', 'Code Review'],
      'Data Science': ['Case Study', 'Technical Assessment', 'Data Analysis Project'],
      'Interior Design': ['Portfolio Review', 'Design Challenge', 'Presentation'],
     
    };
    return assessments[category] || ['Project Work', 'Final Assessment', 'Practical Exam'];
  };

  const getStatusBadge = (status) => {
    const styles = {
      published: 'bg-green-100 text-green-700',
      draft: 'bg-yellow-100 text-yellow-700',
      archived: 'bg-gray-100 text-gray-700',
    };
    return styles[status] || styles.draft;
  };

  const getContentTypeIcon = (type) => {
    switch(type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'text':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-red-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-red-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading program details...</p>
      </div>
    );
  }

  // Error State
  if (error || !program) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Program not found</h2>
          <p className="text-gray-600 mb-6">{error || "The program you're looking for doesn't exist."}</p>
          <Link 
            href="/#programs" 
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="inline mr-2" size={20} />
            Back to Programs
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = program.discount > 0;
  const savedAmount = hasDiscount ? program.original_price - program.final_price : 0;

  return (
    <div className="min-h-screen bg-linear-to-b from-red-50 to-white py-8 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          href="/#programs" 
          className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Programs
        </Link>

        {/* Program Details Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Thumbnail */}
          <div className="relative">
            {program.thumbnail_url ? (
              <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden">
                <img 
                  src={program.thumbnail_url} 
                  alt={program.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${getStatusBadge(program.status)}`}>
                    {program.status}
                  </span>
                </div>

                {/* Discount Badge */}
                {hasDiscount && (
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-full shadow-lg flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      {program.discount}% OFF
                    </span>
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute bottom-6 left-6">
                  <span className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-full shadow-lg">
                    {program.category}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-64 md:h-80 bg-linear-to-r from-red-600 to-red-700 flex items-center justify-center">
                <div className="text-center text-white">
                  <BookOpen className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  <h1 className="text-3xl md:text-4xl font-bold">{program.title}</h1>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 lg:p-10">
            {/* Title and Code */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                {program.title}
              </h1>
              {program.course_code && (
                <p className="text-sm text-gray-400">Course Code: {program.course_code}</p>
              )}
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors">
                <Calendar className="text-red-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-semibold text-gray-900 text-sm">{program.duration}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors">
                <Clock className="text-red-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Mode</p>
                  <p className="font-semibold text-gray-900 text-sm capitalize">{program.mode}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors">
                <GraduationCap className="text-red-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Level</p>
                  <p className="font-semibold text-gray-900 text-sm capitalize">{program.level || 'Beginner'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors">
                <Award className="text-red-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Fee</p>
                  <div className="flex items-baseline gap-2">
                    <p className="font-bold text-gray-900">{program.fee}</p>
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">₹{program.original_price}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex gap-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('curriculum')}
                  className={`pb-3 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'curriculum'
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Curriculum ({program.lessons?.length || 0} lessons)
                </button>
                <button
                  onClick={() => setActiveTab('assessment')}
                  className={`pb-3 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'assessment'
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Assessment
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-50">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Program Overview
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {program.description || `The ${program.title} program offers a comprehensive curriculum designed to develop expertise in ${program.category}. This program is ideal for professionals looking to enhance their skills and advance their careers.`}
                    </p>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="font-semibold text-gray-900">{program.category}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Level</p>
                      <p className="font-semibold text-gray-900 capitalize">{program.level || 'Beginner'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="font-semibold text-gray-900 capitalize">{program.status}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Curriculum Tab */}
              {activeTab === 'curriculum' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Course Curriculum
                  </h3>
                  {program.lessons && program.lessons.length > 0 ? (
                    <div className="space-y-3">
                      {program.lessons.map((lesson, index) => (
                        <div 
                          key={lesson.id || index}
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <div className="shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full capitalize">
                                {lesson.content_type || 'video'}
                              </span>
                              {lesson.is_free_preview && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Play className="w-3 h-3" />
                                  Free Preview
                                </span>
                              )}
                            </div>
                            {lesson.description && (
                              <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              {lesson.duration_seconds && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {Math.floor(lesson.duration_seconds / 60)} min
                                </span>
                              )}
                              {lesson.video_url && (
                                <span className="flex items-center gap-1">
                                  <Video className="w-3 h-3" />
                                  Video
                                </span>
                              )}
                              {lesson.pdf_url && (
                                <span className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  PDF
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No lessons available for this program yet.
                    </p>
                  )}
                </div>
              )}

              {/* Assessment Tab */}
              {activeTab === 'assessment' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Assessment Methods
                  </h3>
                  <div className="space-y-3">
                    {program.assessment && program.assessment.map((item, idx) => (
                      <div 
                        key={idx}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{item}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Comprehensive evaluation of your skills and knowledge in this area.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Apply Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
    <div>
      <p className="text-sm text-gray-500">Ready to enroll?</p>
      <p className="text-2xl font-bold text-gray-900">{program.fee}</p>
      {hasDiscount && (
        <p className="text-sm text-green-600">
          Save ₹{savedAmount} with current discount!
        </p>
      )}
    </div>
    
    {/* Updated Apply Now button with login check */}
    {session ? (
      <Link href={`/programs/${program.id}/checkout`}>
        <button className="w-full sm:w-auto bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md hover:shadow-lg">
          Apply Now
        </button>
      </Link>
    ) : (
      <button 
        onClick={() => {
          // Store the current URL to redirect back after login
          sessionStorage.setItem('redirectAfterLogin', `/programs/${program.id}/checkout`);
          router.push('/login');
        }}
        className="w-full sm:w-auto bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md hover:shadow-lg"
      >
        Login to Apply
      </button>
    )}
  </div>
</div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetailPage;