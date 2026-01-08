
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Youtube, GithubIcon } from 'lucide-react';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#' },
      { name: 'Pricing', href: '#' },
      { name: 'Roadmap', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Community', href: '#' },
      { name: 'Tutorials', href: '#' },
      { name: 'Support', href: '#' },
      { name: 'Legal', href: '#' },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="pt-16 pb-8 border-t border-white/10 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-2xl font-bold mb-4">
                <span className="text-gradient-primary neon-glow animate-glow">bolt</span>
                <span className="text-white">.alpha</span>
              </div>
              
              <p className="text-white/70 mb-6 max-w-md">
                The next generation platform for building and deploying modern web applications. Fast, secure, and scalable.
              </p>
              
              <div className="flex space-x-4">
                <a href="#" className="text-white/70 hover:text-primary transition-colors">
                  <GithubIcon size={20} />
                </a>
                <a href="#" className="text-white/70 hover:text-primary transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-white/70 hover:text-primary transition-colors">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="text-white/70 hover:text-primary transition-colors">
                  <Youtube size={20} />
                </a>
              </div>
            </motion.div>
          </div>
          
          {footerLinks.map((column, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
            >
              <h3 className="font-medium text-white mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <a href={link.href} className="text-white/70 hover:text-gradient transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} bolt.alpha. All rights reserved.
          </p>
          
          <div className="flex space-x-6">
            <a href="#" className="text-white/50 hover:text-gradient transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-white/50 hover:text-gradient transition-colors text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-white/50 hover:text-gradient transition-colors text-sm">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};