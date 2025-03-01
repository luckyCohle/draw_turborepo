import React from 'react';
import { 
  Pencil, 
  Share2, 
  Users, 
  Shapes, 
  Cloud, 
  Sparkles,
  ArrowRight,
  Menu
} from 'lucide-react';
import { Button, btnType } from '@repo/ui/button';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function App() {
  // Custom mobile navigation - non-interactive version
  const MobileNav = () => (
    <div className="md:hidden">
      <div className="flex items-center justify-between py-4 px-4">
        <Link href="/">
          <div className="flex items-center">
            <span className="text-xl font-bold text-indigo-600">Excelidraw</span>
          </div>
        </Link>
        {/* Since we can't use hooks, we're making a non-interactive version */}
        {/* In reality, you'd want to handle this with CSS or through your Navbar component */}
        <div className="flex items-center space-x-4">
          <Link href="/sign-in">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">
              Sign In
            </button>
          </Link>
          <Link href="/sign-up">
            <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              Sign Up
            </button>
          </Link>
          <Menu className="h-6 w-6 text-gray-600 md:hidden" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Use the custom mobile navigation on small screens */}
      <div className="md:hidden">
        <MobileNav />
      </div>
      
      {/* Use the original Navbar on medium and larger screens */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      
      {/* Hero Section */}
      <section className="pt-20 md:pt-32 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
              Whiteboarding,{' '}
              <span className="text-indigo-600">reimagined</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-2">
              Create beautiful hand-drawn diagrams, wireframes, and illustrations with our intuitive drawing tool. Collaborate in real-time with your team.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
              <Link href={"/room"} className="w-full sm:w-auto">
                <button className="w-full bg-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                  Join a Room <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </Link>
              <Link href={"/demoCanvas"} className="w-full sm:w-auto">
                <button className="w-full border-2 border-gray-200 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base md:text-lg font-semibold hover:border-gray-300 transition-colors">
                  Demo
                </button>
              </Link>
            </div>
          </div>
          <div className="mt-10 md:mt-16 rounded-xl overflow-hidden shadow-lg md:shadow-2xl border-4 md:border-8 border-white">
            <img 
              src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=2000&q=80" 
              alt="Excelidraw Interface"
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Everything you need to create</h2>
            <p className="text-lg md:text-xl text-gray-600">Powerful features that make drawing and collaboration seamless</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {[
              {
                icon: <Pencil className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />,
                title: "Intuitive Drawing",
                description: "Natural hand-drawn feel with smart shape recognition and smooth lines."
              },
              {
                icon: <Share2 className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />,
                title: "Easy Sharing",
                description: "Share your drawings instantly with a simple link or embed them anywhere."
              },
              {
                icon: <Users className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />,
                title: "Real-time Collaboration",
                description: "Work together with your team in real-time, see changes as they happen."
              },
              {
                icon: <Cloud className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />,
                title: "Cloud Storage",
                description: "Your drawings are automatically saved and synced across devices."
              },
              {
                icon: <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />,
                title: "Smart Features",
                description: "Advanced tools like auto-layout, snap-to-grid, and smart connecting lines."
              },
              {
                icon: <Shapes className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />,
                title: "Rich Components",
                description: "Extensive library of shapes, arrows, and pre-made components."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-5 md:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-3 md:mb-4">{feature.icon}</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-indigo-600 rounded-xl md:rounded-2xl py-10 md:py-16 px-5 sm:px-8 md:px-16 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4 leading-tight">
              Ready to start creating?
            </h2>
            <p className="text-indigo-100 text-base md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
              Join thousands of teams and individuals who use Excelidraw to bring their ideas to life.
            </p>
            <Link href={"/demoCanvas"} className="inline-block">
              <button className="w-full sm:w-auto bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-indigo-50 transition-colors">
                Get Started for Free
              </button>
            </Link>
          </div>
        </div>
      </section>
      <Footer/>
      
    </div>
  );
}

export default App;