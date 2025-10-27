import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle2, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Successfully subscribed! Check your email for confirmation.');
    setEmail('');
    setLoading(false);
  };

  return (
    <section id="signup" className="py-20 md:py-32 bg-gradient-to-br from-[#2563EB]/5 via-white to-[#10B981]/5 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIwMjAyMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
      
      <div className="max-w-4xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Start Getting Ideas Today
          </h2>
          <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
            Join thousands of entrepreneurs receiving expert-validated SaaS ideas every week
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-3xl shadow-md p-8 md:p-12 border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 py-6 text-lg rounded-xl border-gray-200 focus:border-[#2563EB] focus:ring-[#2563EB]"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-8 py-6 text-lg rounded-xl shadow-md hover:shadow-lg transition-all whitespace-nowrap"
              >
                {loading ? 'Subscribing...' : 'Get This Week\'s Ideas'}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-[#64748B] pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#10B981]" />
                <span>No spam, unsubscribe anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Privacy-first approach</span>
              </div>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-[#64748B] mb-4">Trusted by founders from:</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">Y Combinator</div>
              <div className="text-2xl font-bold text-gray-400">500 Startups</div>
              <div className="text-2xl font-bold text-gray-400">Techstars</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}