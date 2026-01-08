import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  delay?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="card-neon p-6 rounded-xl relative overflow-hidden group cursor-pointer  transition-all duration-500 shadow-lg"
    >
      {/* Dynamic background that changes on hover */}
      <div className="absolute inset-0 bg-gradient-cosmic opacity-30 group-hover:opacity-0 transition-all duration-500 group-hover:bg-gradient-cosmic" />
      
      {/* New background that appears on hover */}
      <div className="absolute inset-0 bg-gradient-neon-pulse opacity-0 group-hover:opacity-100 transition-all duration-700" />
      
      {/* Tech mesh background pattern that appears on hover */}
      <div className="absolute inset-0 bg-gradient-tech-mesh opacity-0 group-hover:opacity-30 transition-all duration-500" />
      
      {/* Shimmer effect that moves across the card on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer transition-opacity duration-700" />
      
      {/* Content container */}
      <div className="relative z-10">
        {/* Icon container with floating animation */}
        <div className="bg-gradient-cosmic glass-morphism p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-4   group-hover:shadow-[0_0_15px_rgba(151,117,250,0.5)] transition-all duration-500">
          <Icon className="w-8 h-8 bg-gradient-neon-pulse  text-primary transition-all duration-500" />
        </div>
        
        {/* Title with gradient text effect on hover */}
        <h3 className="text-xl font-bold mb-2 transition-all duration-300 group-hover:text-gradient-vivid group-hover:neon-glow-subtle">
          {title}
        </h3>
        
        {/* Description with subtle fade-in effect */}
        <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
          {description}
        </p>
      </div>
      
      {/* Decorative glow elements */}
      <motion.div 
        className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-70 transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle, hsla(var(--neon-purple), 0.4) 0%, transparent 70%)",
          filter: "blur(10px)"
        }}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
      />
      
      {/* Top left glow accent */}
      <motion.div 
        className="absolute -top-4 -left-4 w-20 h-20 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle, hsla(var(--neon-blue), 0.3) 0%, transparent 70%)",
          filter: "blur(8px)"
        }}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
      />
    </motion.div>
  );
};