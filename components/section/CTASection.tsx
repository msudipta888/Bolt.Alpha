import { motion } from 'framer-motion';
import { GlowingButton } from '../ui/GlowingButon';

export const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-cyberpunk opacity-80" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full filter blur-[100px] opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-morphism rounded-2xl max-w-4xl mx-auto p-10 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 neon-glow-blue animate-glow">
            Ready to transform your web experience?
          </h2>

          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            Join thousands of developers and companies building the next generation of web applications with bolt.alpha.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <GlowingButton className="text-lg px-8 py-5 cursor-pointer text-white">
              Start for Free
            </GlowingButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
