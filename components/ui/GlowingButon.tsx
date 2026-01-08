import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GlowingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'subtle' | 'neon';
}

export const GlowingButton: React.FC<GlowingButtonProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  // Enhanced variant classes using global.css styles
  const variantClasses = {
    default: 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(151,117,250,0.5)]',
    outline: 'bg-transparent border-2 border-primary text-gradient-primary hover:bg-primary/10 hover:shadow-[0_0_15px_hsla(var(--primary),0.6)]',
    subtle: 'bg-gradient-cosmic hover:bg-gradient-cyberpunk text-gradient-primary',
    neon: 'btn-neon-blue hover:text-gradient-vivid',
  };

  return (
    <Button
      className={cn(
        'relative overflow-hidden transition-all duration-500 font-medium group',
        'focus:ring-2 focus:ring-primary/50 focus:outline-none cursor-pointer',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {/* Main content with z-index to stay on top */}
      <span className="relative z-10 group-hover:neon-glow-subtle">{children}</span>
      
      {/* For outline variant - background appears on hover */}
      {variant === 'outline' && (
        <span className="absolute inset-0 bg-primary/10 opacity-0  transition-opacity duration-300" />
      )}
      
      {/* Hover background effect for other variants */}
      {variant !== 'outline' && (
        <span className="absolute inset-0 transform scale-x-0 origin-left bg-gradient-neon-pulse opacity-80 transition-transform duration-500 group-hover:scale-x-100" />
      )}
      
      {/* Shimmer effect - subtle movement across button */}
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer" />
      
      {/* Accent glow that appears on hover */}
      {variant === 'default' && (
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-holographic transition-opacity duration-300" />
      )}
      
      {/* Additional cyberpunk accent for outline and neon variants */}
      {(variant === 'outline' || variant === 'neon') && (
        <span className="absolute -inset-[1px] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" 
          style={{ 
            boxShadow: variant === 'outline' 
              ? "0 0 10px hsla(var(--primary), 0.6), inset 0 0 4px hsla(var(--primary), 0.4)" 
              : "0 0 10px hsla(var(--neon-blue), 0.6), inset 0 0 4px hsla(var(--neon-blue), 0.4)" 
          }} 
        />
      )}
    </Button>
  );
};