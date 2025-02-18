import { btnType, Button } from "@repo/ui/button";
import { Shapes } from "lucide-react";
import Link from "next/link";


export default function Navbar() {
  return (
    <nav className=" p-4 fixed w-full bg-white/80 backdrop-blur-sm z-50 shadow-lg  border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Shapes className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Excelidraw</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Docs</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Blog</a>
              {/* <Button children={"Open Canvas"} btn={btnType.primary} /> */}
              <Link href="/signin">
              <Button>
                Login
              </Button>
              </Link>
              <Link href="/signup">
              <Button  btn={btnType.primary}>Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

  )
}
