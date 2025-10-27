import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Lightbulb } from 'lucide-react';

const benefits = [
  {
    icon: CheckCircle2,
    title: 'Expert-Validated Ideas',
    description: 'Every idea is thoroughly vetted by industry professionals with proven track records in SaaS entrepreneurship.',
    color: 'text-[#2563EB]',
    bgColor: 'bg-blue-50'
  },
  {
    icon: TrendingUp,
    title: 'Market Research Included',
    description: 'Comprehensive market analysis, competitor insights, and demand validation metrics included with each idea.',
    color: 'text-[#10B981]',
    bgColor: 'bg-green-50'
  },
  {
    icon: Lightbulb,
    title: 'Ready-to-Execute Concepts',
    description: 'Actionable implementation roadmaps with technical requirements, MVP scope, and go-to-market strategies.',
    color: 'text-[#8B5CF6]',
    bgColor: 'bg-purple-50'
  }
];

export default function ValueProposition() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Founders Trust Us
          </h2>
          <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
            We do the heavy lifting so you can focus on building
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className={`${benefit.bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className={`w-7 h-7 ${benefit.color}`} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                
                <p className="text-[#64748B] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}