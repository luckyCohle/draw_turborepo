import React from 'react';
import { Pencil } from 'lucide-react';

const styles = `
  @keyframes drawLine {
    0% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes fadeInOut {
    0%, 100% {
      opacity: 0;
      transform: scale(0);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes progress {
    0% {
      width: 0%;
    }
    50% {
      width: 70%;
    }
    100% {
      width: 100%;
    }
  }

  .line-1 { top: 20%; width: 40%; animation-delay: 0s; }
  .line-2 { top: 40%; width: 30%; animation-delay: 0.5s; }
  .line-3 { top: 60%; width: 45%; animation-delay: 1s; }
  .line-4 { top: 80%; width: 35%; animation-delay: 1.5s; }
  .line-5 { top: 90%; width: 25%; animation-delay: 2s; }

  .dot-1 { top: 25%; left: 25%; animation-delay: 0s; }
  .dot-2 { top: 75%; left: 30%; animation-delay: 0.3s; }
  .dot-3 { top: 35%; left: 70%; animation-delay: 0.6s; }
  .dot-4 { top: 65%; left: 75%; animation-delay: 0.9s; }

  .animate-line {
    animation: drawLine 3s infinite;
  }

  .animate-dot {
    animation: fadeInOut 2s infinite;
  }

  .animate-progress {
    animation: progress 2s ease-in-out infinite;
  }
`;

export function Loading() {
  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-gradient-to-r from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Canvas Animation */}
          <div className="relative w-48 h-48 mx-auto mb-8 bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Drawing Lines Animation */}
            <div className="absolute inset-0">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`absolute h-0.5 bg-purple-600 transform -translate-x-full animate-line line-${i}`}
                  style={{ left: '100%' }}
                />
              ))}
              {/* Dots appearing */}
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={`dot-${i}`}
                  className={`absolute w-2 h-2 rounded-full bg-purple-400 animate-dot dot-${i}`}
                />
              ))}
            </div>
            {/* Pencil Icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Pencil className="w-12 h-12 text-purple-600 animate-bounce" />
            </div>
          </div>

          {/* Loading Text */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Preparing Your Canvas
          </h2>
          <p className="text-gray-600 mb-6">
            Loading creative tools and brushes...
          </p>

          {/* Progress Bar */}
          <div className="w-48 h-1 mx-auto bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 animate-progress" />
          </div>

          {/* Brand */}
          <div className="mt-8 flex items-center justify-center space-x-2">
            <Pencil className="w-5 h-5 text-purple-600" />
            <span className="text-lg font-bold text-gray-800">DrawFlow</span>
          </div>
        </div>
      </div>
    </>
  );
}