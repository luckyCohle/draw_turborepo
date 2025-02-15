import React from 'react';
import { 
  Pencil, 
  Share2, 
  Users, 
  Shapes, 
  Cloud, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button,btnType } from '@repo/ui/button';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar/>
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Whiteboarding,{' '}
              <span className="text-indigo-600">reimagined</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Create beautiful hand-drawn diagrams, wireframes, and illustrations with our intuitive drawing tool. Collaborate in real-time with your team.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                Start Drawing <ArrowRight className="w-5 h-5" />
              </button>
              <button className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-300 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
          <div className="mt-16 rounded-xl overflow-hidden shadow-2xl border-8 border-white">
            <img 
              src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=2000&q=80" 
              alt="Excelidraw Interface"
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to create</h2>
            <p className="text-xl text-gray-600">Powerful features that make drawing and collaboration seamless</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Pencil className="w-8 h-8 text-indigo-600" />,
                title: "Intuitive Drawing",
                description: "Natural hand-drawn feel with smart shape recognition and smooth lines."
              },
              {
                icon: <Share2 className="w-8 h-8 text-indigo-600" />,
                title: "Easy Sharing",
                description: "Share your drawings instantly with a simple link or embed them anywhere."
              },
              {
                icon: <Users className="w-8 h-8 text-indigo-600" />,
                title: "Real-time Collaboration",
                description: "Work together with your team in real-time, see changes as they happen."
              },
              {
                icon: <Cloud className="w-8 h-8 text-indigo-600" />,
                title: "Cloud Storage",
                description: "Your drawings are automatically saved and synced across devices."
              },
              {
                icon: <Sparkles className="w-8 h-8 text-indigo-600" />,
                title: "Smart Features",
                description: "Advanced tools like auto-layout, snap-to-grid, and smart connecting lines."
              },
              {
                icon: <Shapes className="w-8 h-8 text-indigo-600" />,
                title: "Rich Components",
                description: "Extensive library of shapes, arrows, and pre-made components."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 rounded-2xl py-16 px-8 md:px-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to start creating?
            </h2>
            <p className="text-indigo-100 text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of teams and individuals who use Excelidraw to bring their ideas to life.
            </p>
            <button className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition-colors">
              Get Started for Free
            </button>
          </div>
        </div>
      </section>
      <Footer/>
      
    </div>
  );
}

export default App;