import { Scene } from '@/components/3d/Scence'
import { CTASection } from '@/components/section/CTASection'
import { FeaturesSection } from '@/components/section/FeaturedSection'
import { HeroSection } from '@/components/section/HeroSection'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/ui/Footer'
import { Header } from '@/components/ui/Header'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import React from 'react'

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-white relative">
      <Header/>
     <main>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
     </main>
      <Footer/>
    </div>
  )
}

export default Index
