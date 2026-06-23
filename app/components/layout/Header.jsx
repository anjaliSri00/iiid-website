'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, X, User, LogIn, UserPlus, ChevronDown, LogOut, Settings, UserCircle } from 'lucide-react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  // Debug session data
  useEffect(() => {
    // console.log('Session status:', status);
    // console.log('Session data:', session);
  }, [session, status]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // const handleApplyNow = () => {
  //   setIsOpen(false)
  //   setIsDropdownOpen(false)
  //   const programsSection = document.getElementById('programs')
  //   if (programsSection) {
  //     programsSection.scrollIntoView({ behavior: 'smooth' })
  //   }
  // }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    // Try different possible name fields
    return user.full_name || user.email?.split('@')[0] || 'User';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (name === 'User') return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <header className="bg-white sticky max-w-screen-3xl w-full px-4 top-0 z-50 shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-5">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
                IIID
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8 lg:space-x-10">
              <Link href="/" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                Home
              </Link>
              <Link href="/apply-online" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                Apply Online
              </Link>
              <Link href="/#about" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                About
              </Link>
              <Link href="/#programs" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                Programs
              </Link>
            </nav>

            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center space-x-4">
              {/* User Account Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors font-medium"
                >
                  {isAuthenticated ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-semibold">
                        {getUserInitials()}
                      </div>
                      <span>{getUserDisplayName()}</span>
                    </>
                  ) : (
                    <>
                      <User size={18} />
                      <span>Account</span>
                    </>
                  )}
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Settings size={18} />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <UserCircle size={18} />
                          <span>My Profile</span>
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center space-x-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <LogIn size={18} />
                          <span>Login</span>
                        </Link>
                        <Link
                          href="/register"
                          className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                          onClick={()=> setIsDropdownOpen(false)}
                        >
                          <UserPlus size={18} />
                          <span>Register</span>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Apply Now Button */}
              {/* <button 
                onClick={handleApplyNow}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition shadow-sm hover:shadow-md"
              >
                Apply Now
              </button> */}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-900" 
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <nav className="md:hidden py-6 border-t border-gray-100">
              <div className="flex flex-col space-y-5">
                <Link
                  href="/" 
                  className="text-gray-600 hover:text-red-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/apply-online" 
                  className="text-gray-600 hover:text-red-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Apply Online
                </Link>
                <Link 
                  href="#about" 
                  className="text-gray-600 hover:text-red-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/#programs" 
                  className="text-gray-600 hover:text-red-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Programs
                </Link>
                
                {/* Mobile Auth */}
                <div className="pt-4 border-t border-gray-100">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center space-x-3 text-gray-700 py-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-semibold">
                          {getUserInitials()}
                        </div>
                        <div>
                          <span className="font-medium">{getUserDisplayName()}</span>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-3 text-gray-600 hover:text-red-600 transition-colors py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings size={18} />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center space-x-3 text-red-600 hover:text-red-700 transition-colors py-2 w-full"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login" 
                        className="flex items-center space-x-3 text-gray-600 hover:text-red-600 transition-colors py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <LogIn size={18} />
                        <span>Login</span>
                      </Link>
                      <Link
                        href="/register" 
                        className="flex items-center space-x-3 text-gray-600 hover:text-red-600 transition-colors py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <UserPlus size={18} />
                        <span>Register</span>
                      </Link>
                    </>
                  )}
                </div>
                
                {/* Mobile Apply Now Button */}
                {/* <button 
                  onClick={handleApplyNow}
                  className="text-white bg-red-600 px-6 py-2 rounded-md w-full mt-2 hover:bg-red-700 transition"
                >
                  Apply Now
                </button> */}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Red Banner Below Header */}
      <div className="bg-red-600 text-white py-2 w-full text-center overflow-hidden">
        <div className="container-custom">
          <p className="text-sm md:text-base font-medium">
            Certification through assessment of professional experience and industry expertise.
          </p>
        </div>
      </div>
    </>
  )
}