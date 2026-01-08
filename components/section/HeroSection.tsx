"use client";

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { GlowingButton } from '../ui/GlowingButon';
import { Scene } from '../3d/Scence';
import { useRouter } from 'next/navigation';

export const HeroSection = () => {
  const router = useRouter();
  return (
    <section className="h-screen relative overflow-hidden">

      {/* Render the Scene as background */}
      <div className="absolute inset-0 -z-10">
        <Scene />
      </div>

      {/* Optional: If you still want some layered background elements like grid or glowing orbs */}
      <div className="absolute inset-0 bg-grid-pattern bg-[length:30px_30px] opacity-20 -z-5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full filter blur-[100px] opacity-30 animate-pulse-glow -z-5" />
      <div
        className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-neon-blue/30 rounded-full filter blur-[80px] opacity-20 animate-pulse-glow -z-5"
        style={{ animationDelay: '1s' }}
      />

      <div className="container mx-auto mt-36 ml-56 px-4  relative z-50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-gradient font-bold">The future of</span>
              <br />
              <span className="font-bold neon-glow-blue animate-glow">web creation</span>
            </h1>

            <p className="text-lg md:text-xl text-white font-serif mb-8 max-w-lg">
              Build, deploy, and scale modern web applications faster than ever with bolt.alpha's intuitive platform.
            </p>

            <div className="flex flex-wrap gap-4 ml-32">
              <GlowingButton className="text-lg px-8 py-6" onClick={() => {
                router.push("/bolt")
              }}>
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </GlowingButton>

            </div>
          </motion.div>

          <motion.div
            className="flex-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {/* Optionally add more content or visuals here */}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
