import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
  const scrollToSignup = () => {
    const element = document.getElementById('signup');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 -z-10" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#2563EB]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#10B981]/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#2563EB]/20 rounded-full mb-8 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
            <span className="text-sm font-medium text-[#64748B]">Weekly curated ideas</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Top Micro SaaS Ideas
            <br />
            <span className="text-[#2563EB]">of This Week</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-[#64748B] mb-12 leading-relaxed"
          >
            Validated Ideas by Industry Experts
            <br />
            <span className="text-base text-[#64748B]/80 mt-2 inline-block">
              Market-ready concepts with research, validation metrics, and execution roadmaps
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              onClick={scrollToSignup}
              className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-8 py-6 text-lg rounded-xl shadow-md hover:shadow-xl transition-all group"
            >
              Join Founders
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <button
              onClick={() => document.getElementById('preview').scrollIntoView({ behavior: 'smooth' })}
              className="text-[#64748B] hover:text-[#2563EB] font-medium px-6 py-3 transition-colors"
            >
              Newsletter Preview →
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-2 text-sm text-[#64748B]"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#10B981] border-2 border-white"
                />
              ))}
            </div>
            <span className="ml-2">Join 5,000+ founders and investors</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}