import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    quote: "MicroSaaS Weekly has become my secret weapon for staying ahead. The validation metrics alone have saved me months of research time.",
    author: "Sarah Chen",
    role: "Founder, TaskFlow AI",
    image: "SC"
  },
  {
    quote: "As an investor, this newsletter helps me spot trends before they become obvious. The expert validation gives me confidence in deal flow.",
    author: "Michael Rodriguez",
    role: "Partner, Seed Ventures",
    image: "MR"
  },
  {
    quote: "I've built two profitable SaaS products from ideas I discovered here. The execution roadmaps are incredibly detailed and actionable.",
    author: "Emily Watson",
    role: "Serial Entrepreneur",
    image: "EW"
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const previous = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="testimonials" className="py-20 md:py-32 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Loved by Founders & Investors
          </h2>
          <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
            Join the community of successful entrepreneurs who trust our insights
          </p>
        </motion.div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-3xl shadow-md p-8 md:p-16 relative overflow-hidden"
          >
            {/* Quote icon */}
            <Quote className="absolute top-8 right-8 w-16 h-16 text-[#2563EB]/10" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 italic">
                  "{testimonials[currentIndex].quote}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2563EB] to-[#10B981] flex items-center justify-center text-white font-bold text-lg">
                    {testimonials[currentIndex].image}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonials[currentIndex].author}
                    </div>
                    <div className="text-[#64748B]">
                      {testimonials[currentIndex].role}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-100">
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex ? 'w-8 bg-[#2563EB]' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={previous}
                  className="rounded-full"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={next}
                  className="rounded-full"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[#2563EB] mb-2">5,000+</div>
            <div className="text-[#64748B]">Subscribers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[#2563EB] mb-2">200+</div>
            <div className="text-[#64748B]">Ideas Shared</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[#2563EB] mb-2">50+</div>
            <div className="text-[#64748B]">Ideas Built</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[#2563EB] mb-2">98%</div>
            <div className="text-[#64748B]">Satisfaction Rate</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}