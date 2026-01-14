import { motion } from "framer-motion";
import {
  Zap,
  Code,
  Globe,
  Lock,
  Sparkles,
  BarChart,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FeatureCard } from "../ui/FeatureCard";

const features = [
  {
    title: "Lightning Fast",
    description:
      "Deploy in seconds with optimized performance across all devices. Experience blazing-fast load times.",
    icon: Zap,
    highlighted: true,
  },
  {
    title: "Modern Development",
    description:
      "Use the latest web technologies with seamless integration. Build with React, TypeScript, and more.",
    icon: Code,
  },
  {
    title: "Global Edge Network",
    description:
      "Deliver content with ultra-low latency from 300+ locations worldwide. Reach every user instantly.",
    icon: Globe,
  },
  {
    title: "Enterprise Security",
    description:
      "Built-in protection with advanced encryption and authentication. Your data is always secure.",
    icon: Lock,
  },
  {
    title: "AI Integration",
    description:
      "Enhance your applications with integrated AI capabilities. Leverage cutting-edge machine learning.",
    icon: Sparkles,
    highlighted: true,
  },
  {
    title: "Advanced Analytics",
    description:
      "Gain insights with real-time monitoring and reporting. Make data-driven decisions instantly.",
    icon: BarChart,
  },
];

const benefits = [
  "Zero configuration setup",
  "Automatic scaling",
  "Built-in CI/CD",
  "24/7 expert support",
];

export const FeaturesSection = () => {
  return (
    <section
      id="features"
      className="relative py-32 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-600/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6"
          >
            <Badge
              variant="outline"
              className="px-4 py-2 bg-purple-500/10 border-purple-500/30 text-purple-300 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Enterprise-Grade Features</span>
            </Badge>
          </motion.div>

          <h2 className="mb-6">
            <span className="block text-4xl sm:text-5xl md:text-6xl bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent leading-tight">
              Everything You Need
            </span>
            <span className="block text-3xl sm:text-4xl md:text-5xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mt-2">
              to Build Amazing Apps
            </span>
          </h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            Built for developers and designers, our platform delivers everything
            you need to create exceptional web experiences with speed and
            precision.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              delay={0.1 * index}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 rounded-3xl blur-3xl" />
          <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-white/10 rounded-3xl p-8 sm:p-12 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl sm:text-4xl mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Why Choose Our Platform?
                </h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="flex items-center gap-3 group"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 p-0.5">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-purple-400" />
                        </div>
                      </div>
                      <span className="text-slate-300 group-hover:text-white transition-colors">
                        {benefit}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="text-center lg:text-right">
                <p className="text-slate-400 mb-8 text-lg">
                  Join thousands of developers already building with our
                  platform
                </p>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative inline-flex items-center gap-2 px-8 py-4 rounded-full overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 text-white flex items-center gap-2">
                    Start Building Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
                <p className="text-slate-500 mt-4 text-sm">
                  No credit card required • Free 14-day trial
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
    </section>
  );
};
