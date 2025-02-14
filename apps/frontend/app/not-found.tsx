"use client";
import { Pencil, Eraser, Undo2, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Drawing Canvas */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <div className="absolute inset-0 bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Animated elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl font-bold text-gray-200">
              404
            </div>
            <div className="absolute top-0 left-0 w-full h-full">
              <Pencil className="absolute top-4 right-4 w-6 h-6 text-purple-600 animate-bounce" />
              <Eraser className="absolute bottom-4 left-4 w-6 h-6 text-purple-400 animate-pulse" />
              <Undo2 className="absolute top-4 left-4 w-6 h-6 text-blue-400 animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Looks like this canvas is blank! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action Button */}
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Home className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        {/* Brand */}
        <div className="mt-12 flex items-center justify-center space-x-2">
          <Pencil className="w-5 h-5 text-purple-600" />
          <span className="text-lg font-bold text-gray-800">DrawFlow</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}