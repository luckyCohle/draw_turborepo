import { Shapes } from 'lucide-react'
import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shapes className="w-6 h-6 text-indigo-600" />
                  <span className="text-lg font-semibold text-gray-900">Excelidraw</span>
                </div>
                <p className="text-gray-500">© 2024 Excelidraw. All rights reserved.</p>
              </div>
            </div>
          </footer>
  )
}
