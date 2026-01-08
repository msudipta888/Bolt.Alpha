
import { motion } from 'framer-motion';
import { Zap, Code, Globe, Lock, Sparkles, BarChart } from 'lucide-react';
import { FeatureCard } from '../ui/FeatureCard';

const features = [
  {
    title: 'Lightning Fast',
    description: 'Deploy in seconds with optimized performance across all devices.',
    icon: Zap,
  },
  {
    title: 'Modern Development',
    description: 'Use the latest web technologies with seamless integration.',
    icon: Code,
  },
  {
    title: 'Global Edge Network',
    description: 'Deliver content with ultra-low latency from 300+ locations.',
    icon: Globe,
  },
  {
    title: 'Enterprise Security',
    description: 'Built-in protection with advanced encryption and authentication.',
    icon: Lock,
  },
  {
    title: 'AI Integration',
    description: 'Enhance your applications with integrated AI capabilities.',
    icon: Sparkles,
  },
  {
    title: 'Advanced Analytics',
    description: 'Gain insights with real-time monitoring and reporting.',
    icon: BarChart,
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">Powerful Features</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Built for developers and designers, our platform delivers everything you need to create exceptional web experiences.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              delay={0.1 * index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
