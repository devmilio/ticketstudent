import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import logo from "@/images/logo.png"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import SearchBar from '@/components/SearchBar'

function Header() {
  return (
    <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md shadow-lg">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 max-w-7xl mx-auto">

        {/* Logo */}
        <div className="flex items-center justify-between w-full lg:w-auto">
          <Link href="/" className="font-bold shrink-0">
            <Image
              src={logo}
              alt="logo"
              className="w-28 lg:w-32 h-auto"
              priority
            />
          </Link>
        </div>

        {/* Search Bar */}
        <div className="w-full lg:w-[50%] mx-auto">
          <SearchBar />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2 ml-auto">
          <SignedIn>
            <Link href="/seller" className="bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg">
              Vendre des billets
            </Link>

            <Link href="/tickets" className="bg-gray-100 text-gray-800 px-4 py-2 text-sm rounded-lg hover:bg-gray-200 transition-all duration-300 ease-in-out border border-gray-300 shadow-sm hover:shadow-md">
              Mes Billets
            </Link>

            <div className="transition-all duration-200 ease-in-out">
              <UserButton />
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex gap-3">
              <SignInButton mode="modal">
                <button className="bg-gray-100 text-gray-800 px-4 py-2 text-sm rounded-lg hover:bg-gray-200 transition-all duration-300 ease-in-out border border-gray-300 shadow-sm">
                  Se connecter
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg">
                  S'inscrire
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>

        {/* User buttons on mobile */}
        <div className="lg:hidden flex items-center gap-3">
          <SignedIn>
            <div className="transition-all duration-200 ease-in-out">
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <div className="flex gap-3">
              <SignInButton mode="modal">
                <button className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-200 transition-all duration-300 ease-in-out">
                  Se connecter
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out">
                  S'inscrire
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>

        {/* Mobile Action Buttons */}
        <div className="lg:hidden w-full flex flex-col gap-3">
          <SignedIn>
            <Link href="/seller" className="w-full bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg">
              Vendre des billets
            </Link>

            <Link href="/tickets" className="w-full bg-gray-100 text-gray-800 px-4 py-2 text-sm rounded-lg hover:bg-gray-200 transition-all duration-300 ease-in-out border border-gray-300 shadow-sm hover:shadow-md">
              Mes Billets
            </Link>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}

export default Header;
