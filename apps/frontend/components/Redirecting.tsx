import React, { useEffect } from 'react';
import { Shapes, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const RedirectPage = ({ message , destination }:{message:string,destination:string}) => {
    const router = useRouter()
  useEffect(() => {
    // Simulate redirect after 2 seconds
    const timer = setTimeout(() => {
    //   window.location.href = destination;
    router.push(destination);
    }, 3000);

    return () => clearTimeout(timer);
  }, [destination]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Logo Section */}
      <div className="flex items-center space-x-2 mb-8">
        <Shapes className="w-12 h-12 text-indigo-600 animate-pulse" />
        <span className="text-2xl font-bold text-gray-900">Excelidraw</span>
      </div>

      {/* Loading Animation and Message */}
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <div className="text-center">
          <p className="text-xl text-gray-600">{message}</p>
          <p className="text-sm text-gray-500 mt-2">This will only take a moment</p>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-50 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-50" />
      </div>
    </div>
  );
};

export default RedirectPage;