'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-lg text-gray-900">
          REST API Demo
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-black">
                Dashboard
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">
                {user.name} <span className="uppercase text-xs bg-gray-100 px-2 py-0.5 rounded ml-1">{user.role}</span>
              </span>
              <button
                onClick={logout}
                className="bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 hover:text-black">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
