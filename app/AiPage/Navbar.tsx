import Link from 'next/link'
import React from 'react'
import { SignedOut } from '@clerk/nextjs'
import { SignedIn, SignInButton, UserButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'

const Navbar = () => {
   
  return (
   <nav className=' shadow-lg'>
    <div className='container mx-auto px-4'>
     <div className='flex justify-between items-center h-16'>
        <Link href="/" className='text-xl font-bold'>
          <header className="flex items-center justify-between mb-8">
                   <div className="flex items-center">
                     <div className="bg-blue-500 p-2 ml-5 mt-2 rounded-lg">
                       <svg
                         xmlns="http://www.w3.org/2000/svg"
                         className="h-6 w-6"
                         fill="none"
                         viewBox="0 0 24 24"
                         stroke="currentColor"
                       >
                         <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M13 10V3L4 14h7v7l9-11h-7z"
                         />
                       </svg>
                     </div>
                     <h1 className="text-2xl ml-4 font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mt-5">
                       Bolt
                     </h1>
                   </div>
                 </header>
        </Link>
        <div className='flex items-center space-x-4'>
          
           <SignedOut>
                <SignInButton>
                   <Button className='px-4 py-2 rounded-md border border-b-cyan-900 bg-emerald-400 text-white text-sm transition duration-200 cursor-pointer'>
                    Sign in

                   </Button>
                </SignInButton>
            </SignedOut>
            <SignedIn>
                <UserButton/>
            </SignedIn>
            
             
        </div>
     </div>
    </div>
   </nav>
  )
}

export default Navbar
