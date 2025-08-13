'use client'
import Link from "next/link"
import { Building2, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useState } from "react";
import { auth } from "./lib/auth";
import { authClient } from "./lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [name,setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await authClient.signUp.email(
      {
        email,
        password,
        name,
        callbackURL: '/dashboard',
      },
      {
        onError: (ctx) => setError(ctx.error.message),
      },
    );
    setLoading(false);
    if (!error) router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Single Card with Geometric Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden">
        {/* Geometric Pattern Background */}
        <div className="absolute inset-0">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 800 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 80" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <path d="M 0 0 L 80 80" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Single Webflow Conf Card */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-8 max-w-sm w-full border border-gray-700 shadow-2xl">
            {/* Webflow Conf Header */}
            <div className="flex items-center mb-8">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center mr-2">
                <span className="text-white font-bold text-xs">W</span>
              </div>
              <span className="text-white font-semibold">Webflow Conf</span>
            </div>

            {/* Main Content */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white leading-tight mb-6">
                The future
                <br />
                of the web
                <br />
                starts here
              </h2>

              {/* Date badges */}
              <div className="flex items-center space-x-2 mb-8">
                <span className="text-white text-lg font-medium mr-2">Sept.</span>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">17</span>
                </div>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">18</span>
                </div>
              </div>

              {/* Register Button */}
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold py-3 px-6 rounded-md transition-colors flex items-center justify-center group">
                Register now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 bg-white">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">Webflow</span>
            </div>
          </div>

          {/* Welcome heading */}
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-8">Welcome to Webflow</h1>

          {/* Google Sign Up Button */}
          <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors mb-6">
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Signup form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
               <input
                type="name"
                value={name}
                onChange={(e)=>setName(e.target.value)}
                placeholder="Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                placeholder="Work email address"
                className="w-full mt-4 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                required
              />
              
              <input
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                placeholder="Password"
                className="w-full mt-4 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                required
              />
            
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
            > 
              {loading ? 'Signing up...' : 'Continue'}
            </button>
          </form>

          {/* Terms text */}
          <p className="text-xs text-gray-500 text-center mt-6 leading-relaxed">
            Signing up for a Webflow account means you agree to the{" "}
            <Link href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>
          </p>

          {/* Login link */}
          <p className="text-sm text-gray-600 text-center mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Log in
            </Link>
          </p>

          {/* Enterprise section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <Building2 className="h-4 w-4 mr-2" />
                <span className="text-sm">Building an Enterprise site?</span>
              </div>
              <Link href="#" className="text-sm text-blue-600 hover:underline font-medium">
                Contact sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
