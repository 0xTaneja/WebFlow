'use client'

import Link from "next/link"
import { ArrowRight, Eye } from "lucide-react"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "./lib/auth-client";

export default function LoginPage() {
  
  const router = useRouter();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState<string | null>(null);
  const [loading,setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await authClient.signIn.email(
      {
        email,
        password,
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

      {/* Right Side - Login Form */}
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

          {/* Login heading */}
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-8">Log in to your account</h1>

          {/* SSO Button */}
          <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors mb-6">
            <div className="w-4 h-4 mr-3 bg-gray-400 rounded"></div>
            Continue with SSO
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

          {/* Login form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                placeholder="Email address or username"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                required
              />
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 pr-10"
                required
              />
             
              <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Eye className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <div className="text-right">
              <Link href="#" className="text-sm text-blue-600 hover:underline">
                Forgot your password?
              </Link>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
            >
              {loading ? 'Logging in...' : 'Continue'}
            </button>
          </form>

          {/* Signup link */}
          <p className="text-sm text-gray-600 text-center mt-8">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              Sign up
            </Link>
          </p>

          {/* Webflow Optimize link */}
          <p className="text-sm text-center mt-6">
            <Link href="#" className="text-blue-600 hover:underline">
              Sign in to Webflow Optimize
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
