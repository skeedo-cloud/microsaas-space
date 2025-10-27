import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function FeaturedIdea() {
  const scrollToSignup = () => {
    const element = document.getElementById('signup');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="preview" className="py-20 md:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20">
            This Week's Featured
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            See What You'll Get
          </h2>
          <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
            Here's a glimpse of the type of validated ideas delivered to your inbox weekly
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-md overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-white/20 text-white border-white/30">
                🏥 HealthTech
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                B2B SaaS
              </Badge>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              AI-Powered Medical Appointment Scheduling Platform
            </h3>
            <p className="text-blue-100">
              Solving the $150B healthcare scheduling inefficiency problem
            </p>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <div className="space-y-8">
              {/* Problem Statement */}
              <div>
                <h4 className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-3">
                  Problem Statement
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  Healthcare providers lose 30-40% of potential revenue due to no-shows and inefficient scheduling. 
                  Traditional booking systems lack intelligent rescheduling and patient engagement features.
                </p>
              </div>

              {/* Solution Overview */}
              <div>
                <h4 className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-3">
                  Solution Overview
                </h4>
                <p className="text-gray-700 leading-relaxed mb-4">
                  An AI-driven platform that predicts no-shows, automatically optimizes appointment slots, 
                  and sends personalized reminders via SMS/email. Includes telemedicine integration and 
                  waitlist management with real-time availability updates.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-50 text-[#2563EB] rounded-full text-sm">AI Predictions</span>
                  <span className="px-3 py-1 bg-blue-50 text-[#2563EB] rounded-full text-sm">Smart Reminders</span>
                  <span className="px-3 py-1 bg-blue-50 text-[#2563EB] rounded-full text-sm">Telemedicine</span>
                  <span className="px-3 py-1 bg-blue-50 text-[#2563EB] rounded-full text-sm">Waitlist Management</span>
                </div>
              </div>

              {/* Market Validation Metrics */}
              <div>
                <h4 className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-4">
                  Market Validation
                </h4>
                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-[#2563EB]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">$4.2B</div>
                      <div className="text-sm text-[#64748B]">Market Size (TAM)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-50 p-3 rounded-xl">
                      <Users className="w-6 h-6 text-[#10B981]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">850K+</div>
                      <div className="text-sm text-[#64748B]">Target Clinics (US)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-50 p-3 rounded-xl">
                      <DollarSign className="w-6 h-6 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">$299/mo</div>
                      <div className="text-sm text-[#64748B]">Avg. Revenue/Client</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-6 border-t border-gray-100">
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Want the full analysis?
                    </p>
                    <p className="text-sm text-[#64748B]">
                      Get complete execution roadmap, tech stack, and competitive analysis
                    </p>
                  </div>
                  <Button
                    onClick={scrollToSignup}
                    className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white whitespace-nowrap group"
                  >
                    Subscribe Now
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}