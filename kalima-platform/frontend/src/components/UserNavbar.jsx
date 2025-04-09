"use client"

import { useState } from "react"
import { FaBell, FaEnvelope } from "react-icons/fa"

const UserNavbar = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  return (
    <div className="navbar shadow-sm px-4 py-2">
      <div className="flex justify-around w-full">
        {/* Left side - User info */}
        <div className="flex items-center gap-2">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </label>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-bold text-sm">سيد أحمد</span>
            <span className="text-xs">طالب</span>
          </div>
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img
                src="hero.png"
                alt="User avatar"
                className="w-8 h-8"
              />
            </div>
          </div>
        </div>

        {/* Right side - Search and notifications */}
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-circle">
            <div className="indicator">
              <FaBell className="h-5 w-5" />
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </button>
          <button className="btn btn-ghost btn-circle">
            <div className="indicator">
              <FaEnvelope className="h-5 w-5" />
            </div>
          </button>
          <div className="form-control relative hidden sm:block">
            <input
              type="text"
              placeholder="ما الذي تبحث عنه؟"
              className="input input-bordered w-full max-w-xs text-right pr-10"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <div className="absolute top-1/2 transform -translate-y-1/2 right-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          {/* Search icon for mobile */}
          <button className="btn btn-ghost btn-circle sm:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserNavbar
