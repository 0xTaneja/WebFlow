import Image from "next/image"
import Link from "next/link"
import { Button } from "../web/app/components/ui/button"
import { ArrowRight, ChevronDown } from "lucide-react"

export default function Component() {
  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Banner */}
      <div className="bg-blue-600 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex-1 text-center">
            <span className="text-sm">Legendary marketer Seth Godin is headlining Webflow Conf 2025</span>
          </div>
          <Link href="#" className="flex items-center text-sm hover:underline">
            Register now <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <span className="ml-2 text-xl font-semibold text-gray-900">Webflow</span>
              </Link>

              <div className="hidden md:flex items-center space-x-6">
                <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-600">
                  <span className="text-sm font-medium">Platform</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
                <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-600">
                  <span className="text-sm font-medium">Solutions</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
                <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-600">
                  <span className="text-sm font-medium">Resources</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
                <Link href="#" className="text-sm font-medium hover:text-blue-600">
                  Enterprise
                </Link>
                <Link href="#" className="text-sm font-medium hover:text-blue-600">
                  Pricing
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                Log in
              </Link>
              <Link href="#" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                Contact sales
              </Link>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm">
                <Link href="/signup">Get started — it's free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-sm font-medium text-gray-600 tracking-wide uppercase mb-8">MORE THAN A WEBSITE BUILDER</p>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 leading-none mb-8">
            Turn traffic
            <br />
            into revenue
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            With Webflow's all-in-one platform, you can create, manage, and optimize web experiences that convert —
            without sacrificing brand consistency.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base">
              <Link href="/signup">Start building</Link>
            </Button>
            <Button size="lg" variant="ghost" className="text-gray-900 hover:text-blue-600 px-8 py-3 text-base">
              Contact sales <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Company Logos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-8 items-center opacity-60">
          {/* Row 1 */}
          <div className="flex justify-center">
            <span className="text-lg font-semibold text-gray-800">verifone</span>
          </div>
          <div className="flex justify-center">
            <span className="text-lg font-bold text-gray-800">NCR Voyix</span>
          </div>
          <div className="flex justify-center">
            <span className="text-lg font-semibold text-gray-800">monday.com</span>
          </div>
          <div className="flex justify-center">
            <span className="text-lg font-bold text-gray-800">Spotify</span>
          </div>
          <div className="flex justify-center">
            <span className="text-2xl font-bold text-gray-800">TED</span>
          </div>
          <div className="flex justify-center">
            <span className="text-lg font-semibold text-gray-800">Dropbox</span>
          </div>
          <div className="flex justify-center">
            <span className="text-lg font-medium text-gray-800">greenhouse</span>
          </div>
          <div className="flex justify-center">
            <span className="text-lg font-bold text-gray-800">CLEAR</span>
          </div>
          <div className="flex justify-center">
            <span className="text-sm font-bold text-gray-800">ORANGETHEORY FITNESS</span>
          </div>
          <div className="flex justify-center">
            <span className="text-lg font-bold text-gray-800">Checkout.com</span>
          </div>

          {/* Row 2 */}
          <div className="flex justify-center">
            <span className="text-lg font-medium text-gray-800">SoundCloud</span>
          </div>
          <div className="flex justify-center">
            <span className="text-xl font-bold text-gray-800">MIZUHO</span>
          </div>
          <div className="flex justify-center">
            <span className="text-xl font-bold text-gray-800">IDEO</span>
          </div>
          <div className="flex justify-center">
            <span className="text-lg font-semibold text-gray-800">docusign</span>
          </div>
          <div className="flex justify-center">
            <span className="text-xl font-bold text-gray-800">ABM</span>
          </div>
          <div className="flex justify-center">
            <span className="text-sm font-serif text-gray-800">The New York Times</span>
          </div>
          <div className="flex justify-center">
            <span className="text-lg font-bold text-gray-800">Mural</span>
          </div>
          <div className="flex justify-center">
            <span className="text-lg font-semibold text-gray-800">Upwork</span>
          </div>
          <div className="flex justify-center">
            <span className="text-lg font-bold text-gray-800">Discord</span>
          </div>
          <div className="flex justify-center">
            <span className="text-lg font-bold text-gray-800">Lattice</span>
          </div>
        </div>
      </section>

      {/* Platform Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative">
          <Image
            src="/webflow-interface.png"
            alt="Webflow platform interface preview"
            width={1200}
            height={600}
            className="w-full rounded-lg shadow-2xl"
          />
        </div>
      </section>
    </div>
  )
}
