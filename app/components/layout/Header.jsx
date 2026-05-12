'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, X, User, LogIn, UserPlus, ChevronDown } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

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

  return (
    <>
      <header className="bg-white sticky max-w-screen-3xl w-full px-4 top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-5">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
                IIID
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8 lg:space-x-10">
              <Link href="#home" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                Home
              </Link>
              <Link href="/apply-online" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                Apply Online
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                About
              </Link>
              <Link href="#shop" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                Shop
              </Link>
            </nav>

            {/* Desktop Right Section - Login/Register */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Login/Register Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors font-medium"
                >
                  <User size={18} />
                  <span>Account</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <Link
                      href="#login"
                      className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <LogIn size={18} />
                      <span>Login</span>
                    </Link>
                    <Link
                      href="#register"
                      className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <UserPlus size={18} />
                      <span>Register</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Apply Now Button */}
              <button className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition shadow-sm hover:shadow-md">
                Apply Now
              </button>
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
                  href="#home" 
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
                  href="#shop" 
                  className="text-gray-600 hover:text-red-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Shop
                </Link>
                
                {/* Mobile Login/Register */}
                <div className="pt-4 border-t border-gray-100">
                  <Link
                    href="#login" 
                    className="flex items-center space-x-3 text-gray-600 hover:text-red-600 transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <LogIn size={18} />
                    <span>Login</span>
                  </Link>
                  <Link
                    href="#register" 
                    className="flex items-center space-x-3 text-gray-600 hover:text-red-600 transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <UserPlus size={18} />
                    <span>Register</span>
                  </Link>
                </div>
                
                <button className="text-white bg-red-600 px-6 py-2 rounded-md w-full mt-2 hover:bg-red-700 transition">
                  Apply Now
                </button>
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