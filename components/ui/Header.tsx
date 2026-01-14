"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignUpButton, UserButton } from '@clerk/nextjs';

const navItems = [
  { name: 'Features', href: '/#features' },
  { name: 'Solutions', href: '/#solutions' }
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const handleNew = () => {

  }
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-lg shadow-md' : 'bg-transparent'
        }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <motion.div
          className="text-2xl font-bold flex items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/">
            <span className="text-gradient-primary neon-glow-cyan animate-glow  text-3xl">Bolt</span>
            <span className="text-white text-2xl">.alpha</span>
          </Link>
        </motion.div>

        <nav className="hidden md:flex items-center space-x-8">
          <motion.ul
            className="flex space-x-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1, delayChildren: 0.2 }}
          >
            {isHome ? (
              navItems.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * i }}
                >
                  <a
                    href={item.href}
                    className="text-white/70 hover:text-white transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0  after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                  >
                    {item.name}
                  </a>
                </motion.li>
              ))
            ) : (
              <motion.li
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href="/"
                  className="text-white/70 hover:text-white transition-colors duration-300"
                >
                  Home
                </Link>
              </motion.li>
            )}
          </motion.ul>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {isHome ? (
              <div className='flex flex-row space-x-3'>
                <Link href="/bolt">
                  <Button className="btn-neon text-primary-foreground hover:bg-violet-500">
                    Launch App
                  </Button>
                </Link>
                <div>
                  <SignedOut>
                    <SignUpButton>
                      <Button className='px-4 py-2 rounded-md border border-b-cyan-900 bg-emerald-400 text-white text-sm transition duration-200 cursor-pointer'>
                        Sign up

                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              </div>
            ) : (
              <Button className="btn-neon-blue text-primary-foreground" onClick={handleNew}>
                New Project
              </Button>
            )}
          </motion.div>
        </nav>

        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <motion.div
          className="md:hidden absolute top-[72px] left-0 right-0  backdrop-blur-lg  border-white/10 shadow-lg py-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <nav className="container mx-auto px-4">
            <ul className="flex flex-col space-y-4">
              {isHome ? (
                navItems.map((item, i) => (
                  <li key={i}>
                    <a
                      href={item.href}
                      className="text-white/70 hover:text-white block py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  </li>
                ))
              ) : (
                <li>
                  <Link
                    href="/"
                    className="text-white/70 hover:text-white block py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                </li>
              )}
            </ul>
            <div className="mt-6">
              {isHome ? (
                <Link href="/editor" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full btn-neon text-primary-foreground">
                    Launch App
                  </Button>
                </Link>
              ) : (
                <Button className="w-full btn-neon-blue text-primary-foreground ">
                  New Project
                </Button>
              )}
            </div>
          </nav>
        </motion.div>
      )}
    </header>
  );
};
