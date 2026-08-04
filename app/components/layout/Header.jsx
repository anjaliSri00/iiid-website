'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, X, User, LogIn, UserPlus, ChevronDown, LogOut, Settings, UserCircle, Award, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { logo } from '@/public/img'

export default function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

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

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
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
      <header className="bg-white/90 sticky max-w-screen-3xl w-full px-4 top-0 z-50 border-b border-[#D4A574]/20">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            {/* Logo */}
             <Link href="/" className="flex items-center group">
              <div className="relative h-10 md:h-12 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                <Image 
                  src={logo}
                  alt="IIID - International Institute of Interior Design" 
                  width={180} 
                  height={48}
                  className="object-contain h-full w-auto"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8 lg:space-x-10">
              <Link href="/" className="text-gray-600 hover:text-[#CC0000] transition-colors font-medium relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#CC0000] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/about-us" className="text-gray-600 hover:text-[#CC0000] transition-colors font-medium relative group">
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#CC0000] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/apply-online" className="text-gray-600 hover:text-[#CC0000] transition-colors font-medium relative group">
                Apply Online
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#CC0000] transition-all duration-300 group-hover:w-full"></span>
              </Link>
             
              {/* <Link href="#programs" className="text-gray-600 hover:text-[#CC0000] transition-colors font-medium relative group">
                Programs
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#CC0000] transition-all duration-300 group-hover:w-full"></span>
              </Link> */}
              <Link href="/contact-us" className="text-gray-600 hover:text-[#CC0000] transition-colors font-medium relative group">
              Contact Us
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#CC0000] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center space-x-4">
              {/* User Account Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#CC0000] transition-colors font-medium px-3 py-2 rounded-lg hover:bg-[#FDF8F0]"
                >
                  {isAuthenticated ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-[#CC0000] text-white flex items-center justify-center text-sm font-semibold">
                        {getUserInitials()}
                      </div>
                      <span className="hidden lg:inline">{getUserDisplayName()}</span>
                    </>
                  ) : (
                    <>
                      <User size={18} className="text-[#CC0000]" />
                      <span>Account</span>
                    </>
                  )}
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white shadow-lg border border-[#D4A574]/20 py-2 z-50">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b border-[#D4A574]/20 bg-[#ffff]">
                          <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-[#FDF8F0] hover:text-[#CC0000] transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Settings size={18} className="text-[#D4A574]" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-[#FDF8F0] hover:text-[#CC0000] transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <UserCircle size={18} className="text-[#D4A574]" />
                          <span>My Profile</span>
                        </Link>
                        <div className="border-t border-[#D4A574]/20 my-1"></div>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center space-x-3 px-4 py-2.5 text-[#CC0000] hover:bg-[#CC0000]/5 transition-colors w-full text-left"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-[#FDF8F0] hover:text-[#CC0000] transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <LogIn size={18} className="text-[#D4A574]" />
                          <span>Login</span>
                        </Link>
                        <Link
                          href="/register"
                          className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-[#FDF8F0] hover:text-[#CC0000] transition-colors"
                          onClick={()=> setIsDropdownOpen(false)}
                        >
                          <UserPlus size={18} className="text-[#D4A574]" />
                          <span>Register</span>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-900 hover:text-[#CC0000] transition-colors p-2 hover:bg-[#FDF8F0]" 
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <nav className="md:hidden py-6 border-t border-[#D4A574]/20 bg-white">
              <div className="flex flex-col space-y-4">
                <Link
                  href="/" 
                  className="text-gray-600 hover:text-[#CC0000] transition-colors px-3 py-2 hover:bg-[#FDF8F0]"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/apply-online" 
                  className="text-gray-600 hover:text-[#CC0000] transition-colors px-3 py-2  hover:bg-[#FDF8F0]"
                  onClick={() => setIsOpen(false)}
                >
                  Apply Online
                </Link>
                <Link 
                  href="/#about" 
                  className="text-gray-600 hover:text-[#CC0000] transition-colors px-3 py-2 hover:bg-[#FDF8F0]"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/programs" 
                  className="text-gray-600 hover:text-[#CC0000] transition-colors px-3 py-2  hover:bg-[#FDF8F0]"
                  onClick={() => setIsOpen(false)}
                >
                  Programs
                </Link>
                 <Link href="/contact-us"
                                   onClick={() => setIsOpen(false)}
                  className="text-gray-600 hover:text-[#CC0000] transition-colors px-3 py-2 hover:bg-[#FDF8F0]"
                  >
              Contact Us
              </Link>
                
                {/* Mobile Auth */}
                <div className="pt-4 border-t border-[#D4A574]/20">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center space-x-3 text-gray-700 py-2 px-3 bg-[#FDF8F0] ">
                        <div className="w-8 h-8 bg-[#CC0000] text-white flex items-center justify-center text-sm font-semibold">
                          {getUserInitials()}
                        </div>
                        <div>
                          <span className="font-medium">{getUserDisplayName()}</span>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-3 text-gray-600 hover:text-[#CC0000] transition-colors py-2 px-3 hover:bg-[#FDF8F0]"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings size={18} className="text-[#D4A574]" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center space-x-3 text-[#CC0000] hover:bg-[#CC0000]/5 transition-colors py-2 px-3 w-full"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login" 
                        className="flex items-center space-x-3 text-gray-600 hover:text-[#CC0000] transition-colors py-2 px-3 hover:bg-[#FDF8F0]"
                        onClick={() => setIsOpen(false)}
                      >
                        <LogIn size={18} className="text-[#D4A574]" />
                        <span>Login</span>
                      </Link>
                      <Link
                        href="/register" 
                        className="flex items-center space-x-3 text-gray-600 hover:text-[#CC0000] transition-colors py-2 px-3 hover:bg-[#FDF8F0]"
                        onClick={() => setIsOpen(false)}
                      >
                        <UserPlus size={18} className="text-[#D4A574]" />
                        <span>Register</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Cream Banner Below Header */}
      <div className="bg-[#bd0707] border-b border-[#D4A574]/20 py-2.5 w-full text-center overflow-hidden">
        <div className="container-custom px-4">
          <p className="text-xs font-medium text-white/90 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ffff]/50" />
            Certification through assessment of professional experience and industry expertise.
            <Sparkles className="w-4 h-4 text-[#ffff]/50" />
          </p>
        </div>
      </div>
    </>
  )
}