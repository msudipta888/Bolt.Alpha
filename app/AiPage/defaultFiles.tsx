export const file = {
  "/index.js": {
    code: `
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./App.css";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
`
  },

  "/App.js": {
    code: `
import React from "react";
import { Zap, Shield, Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <main className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto space-y-8"
        >
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
              <div className="relative p-4 bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl">
                <Sparkles className="w-10 h-10 text-blue-400" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Faster</span>
            <br /> 
            Ship <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Smarter</span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The instant full-stack web development environment. Describe your app, and watch it come to life with modern, production-ready code.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
            {[
              { icon: Zap, title: "Instant Setup", desc: "Zero configuration required. Start coding immediately." },
              { icon: Shield, title: "Production Ready", desc: "Best practices and modern standards built-in by default." },
              { icon: Star, title: "Premium Design", desc: "Beautiful, responsive UI components out of the box." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-blue-500/50 transition-all duration-300 group"
              >
                <item.icon className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="pt-8">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-300 text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Ready to Start
             </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
`
  }
  ,
  "/components/ui.js": {
    code: `
import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Card = ({ children, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={cn(
      "bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-blue-500/30 transition-colors",
      className
    )}
  >
    {children}
  </motion.div>
);

export const Button = ({ children, className, variant = "primary", ...props }) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20",
    outline: "bg-white/5 hover:bg-white/10 border border-white/10 text-white",
    ghost: "hover:bg-white/5 text-zinc-400 hover:text-white"
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "px-4 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const Input = ({ className, ...props }) => (
  <input
    className={cn(
      "w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all",
      className
    )}
    {...props}
  />
);

export const Badge = ({ children, className }) => (
  <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20", className)}>
    {children}
  </span>
);

export const GradientText = ({ children, className }) => (
  <span className={cn("text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-500", className)}>
    {children}
  </span>
);
`
  },
  "/App.css": {
    code: `
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  
  body {
    background: #09090b;
    color: #fafafa;
    -webkit-font-smoothing: antialiased;
  }

  /* Custom Premium Utilities */
  .glass {
    background: rgba(24, 24, 27, 0.4);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .text-gradient {
    background: linear-gradient(to right, #fff, #71717a);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .glow-blue {
    box-shadow: 0 0 20px -5px rgba(59, 130, 246, 0.5);
  }
`
  },

  "/package.json": {
    code: `{
    "name": "Bolt",
    "version": "0.1.0",
    "private": true,
    "dependencies": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "react-router-dom": "^6.22.0",
      "react-scripts": "^5.0.1",
      "web-vitals": "^2.1.4",
      "postcss": "^8.4.31",
      "lucide-react": "^0.482.0",
      "tailwindcss": "^3.4.1",
      "autoprefixer": "^10.0.0",
      "uuid": "^11.1.0",
      "tailwind-merge": "^2.4.0",
      "tailwindcss-animate": "^1.0.7",
      "@google/generative-ai": "^0.21.0",
      "date-fns": "^4.1.0",
      "react-chartjs-2": "^5.3.0",
      "chart.js": "^4.4.1",
      "framer-motion": "^11.0.0",
      "clsx": "^2.1.0",
      "sonner": "^1.4.0",
      "class-variance-authority": "^0.7.0",
      "@radix-ui/react-slot": "^1.0.2",
      "@radix-ui/react-dialog": "^1.0.5",
      "@radix-ui/react-dropdown-menu": "^2.0.6",
      "@radix-ui/react-tooltip": "^1.0.7",
      "@radix-ui/react-tabs": "^1.0.4"
    }
  }`
  }
};
