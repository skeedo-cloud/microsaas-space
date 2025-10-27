  
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FeaturedIdea from '../components/landing/FeaturedIdea';
import NewsletterSignup from '../components/landing/NewsletterSignup';
import LiveSocialProof from '../componentsv2/LiveSocialProof';
import {
  Radar,
  CheckCircle,
  TrendingUp,
  Zap,
  Clock,
  Users,
  Search,
  Filter,
  Send,
  Star,
  ArrowRight,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
  ChevronDown,
  Sparkles,
  BarChart3,
  Flame,
  Rocket,
  Eye,
  Brain,
  Crown,
  Shield,
  Target,
  Award,
  TrendingDown,
  Plus,
  Minus,
  DollarSign,
  FileText,
  Smartphone,
  Calendar,
  Lightbulb } from
"lucide-react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";

// Subtle Background Patterns - This component will be replaced in HeroSection
const BackgroundPatterns = () => {
  return (
    <>
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.2)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>
      
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
    </>);

};

// Sticky Navigation
const Navigation = ({ scrollToForm }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ?
      'bg-white/95 backdrop-blur-xl border-b border-blue-200 shadow-sm' :
      'bg-transparent'}`
      }>

      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <Radar className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">
            Micro-SaaS Space
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'Sample', 'Testimonials', 'FAQ'].map((item) =>
          <a
            key={item}
            href={`#${item.toLowerCase().replace(' ', '-')}`}
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm">

              {item}
            </a>
          )}
        </div>

        <Button
          onClick={scrollToForm}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md shadow-blue-500/25">
          Subscribe Free
          <Mail className=" w-4 h-4" />
        </Button>
      </div>
    </motion.nav>);

};

// Hero Section with prominent email input
const HeroSection = ({ scrollToForm }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus({ type: "error", message: "Please enter a valid email" });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch(
        `https://n8n.srv1010179.hstgr.cloud/webhook/v2/saas-radar?query=${encodeURIComponent(email)}`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );

      if (response.ok) {
        setStatus({ type: "success", message: "🎉 Success! Check your inbox for confirmation." });
        setEmail("");
      } else {
        setStatus({ type: "error", message: "Something went wrong. Please try again." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Connection error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50/30 pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />

        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -40, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />

      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#2563EB]/20 rounded-full mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
            <span className="text-sm font-medium text-[#64748B]">Weekly curated ideas</span>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-7xl font-bold mb-6 text-gray-900 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}>

          Build That Matters
          <br />
          <span className="text-blue-600">Ship that Sells</span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}>

          Join 5,000+ founders getting <span className="font-semibold text-blue-600">10 validated SaaS ideas</span> every week — expertly curated from Reddit, Indie Hackers, and Product Hunt.
        </motion.p>

        {/* Prominent Email Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-lg mx-auto mb-8">

          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl p-2 shadow-md border-2 border-blue-500">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white border-0 focus:ring-0 text-lg px-4 py-4 rounded-xl"
                  disabled={isSubmitting} />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold whitespace-nowrap shadow-lg shadow-blue-500/25">

                  {isSubmitting ?
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> :
                  <>
                      Get Ideas Free
                      <ArrowRight className="w-5 h-5" />
                    </>
                  }
                </Button>
              </div>
            </div>
            {status &&
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 text-sm font-medium ${
              status.type === "success" ? "text-green-600" : "text-red-600"}`
              }>

                {status.message}
              </motion.div>
            }
          </form>
          <p className="text-sm text-gray-500 mt-4">
            ✓ Free forever · ✓ Unsubscribe anytime · ✓ 5,000+ subscribers
          </p>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">

          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-700">Reddit</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-700">Product Hunt</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-700">Indie Hackers</span>
          </div>
        </motion.div>
      </div>
    </section>);

};

// Social Proof Section
const SocialProofSection = () => {
  const stats = [
  { value: "5,000+", label: "Active Subscribers", icon: Users },
  { value: "10", label: "Ideas Per Week", icon: Lightbulb },
  { value: "94%", label: "Open Rate", icon: Mail },
  { value: "500+", label: "Ideas Validated", icon: CheckCircle }];


  return (
    <section className="py-20 bg-white border-y border-blue-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, index) =>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="text-center">

              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

};

// Features Section
const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
  {
    icon: Brain,
    title: "Expert-Validated Insights",
    description: "Every idea is curated and validated by industry experts for real-world potential."
  },
  {
    icon: Users,
    title: "Community-Powered Discovery",
    description: "Ideas sourced directly from founders and makers solving real problems."
  },
  {
    icon: Clock,
    title: "Save Hours of Research",
    description: "Stop scrolling endlessly — get high-signal ideas curated for you every Friday."
  },
  {
    icon: Zap,
    title: "Early-Mover Advantage",
    description: "Be among the first to act on rising SaaS opportunities."
  }];


  return (
    <section id="features" ref={ref} className="py-24 bg-blue-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16">

          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Why <span className="text-blue-600">5,000+ Founders</span> Trust Us
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get validated SaaS opportunities delivered to your inbox every week
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) =>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.1 }}>

              <Card className="h-full border border-blue-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all bg-white">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

};

// How It Works Section
const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
  {
    icon: Search,
    title: "Collect",
    description: "Our AI scouts SaaS discussions from Reddit, Indie Hackers, and Product Hunt."
  },
  {
    icon: Filter,
    title: "Curate & Validate",
    description: "Each opportunity is reviewed, refined, and validated by industry experts using trend data."
  },
  {
    icon: Send,
    title: "Deliver",
    description: "Receive your top 10 weekly SaaS opportunities straight to your inbox every Friday."
  }];


  return (
    <section id="how-it-works" ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16">

          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From discovery to your inbox — expertly curated every week
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) =>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="relative text-center">

              <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
                <step.icon className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {index + 1}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

};

// Newsletter Sample Preview Section
const NewsletterSampleSection = () => {
  const sampleIdeas = [
  { title: "AI-Powered Code Review Tool", category: "DevTools", score: "9.2/10" },
  { title: "No-Code Customer Onboarding", category: "SaaS Tools", score: "8.8/10" },
  { title: "Automated Meeting Summarizer", category: "Productivity", score: "9.5/10" }];


  return (
    <section id="sample" className="py-24 bg-blue-50">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16">

          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            See What You'll Get
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every Friday, receive a curated digest of validated opportunities
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}>

          <Card className="border-2 border-blue-200 shadow-xl bg-white overflow-hidden">
            <div className="bg-blue-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Micro-SaaS Space #142</h3>
                  <p className="text-blue-100">10 Validated Ideas · Friday, Jan 5, 2025</p>
                </div>
                <Badge className="bg-blue-600 text-white border-0">
                  <Star className="w-4 h-4 mr-1" />
                  Premium
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="space-y-6">
                {sampleIdeas.map((idea, index) =>
                <div key={index} className="border-l-4 border-blue-500 pl-6 py-2">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-xl font-bold text-gray-900">{idea.title}</h4>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {idea.score}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {idea.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        High Growth Potential
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 rounded-xl text-lg font-semibold shadow-lg shadow-blue-500/25">
                  <FileText className="mr-2 w-5 h-5" />
                  View Full Sample Issue
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>);

};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
  {
    quote: "This newsletter helped me launch my SaaS side project in just 3 months.",
    author: "Alex Chen",
    role: "Indie Maker",
    avatar: "AC"
  },
  {
    quote: "Every issue feels like a goldmine of startup inspiration. Highly recommended!",
    author: "Rina Patel",
    role: "Product Developer",
    avatar: "RP"
  },
  {
    quote: "Finally a newsletter that saves me time and sparks real, actionable ideas.",
    author: "Sam Rodriguez",
    role: "Growth Hacker",
    avatar: "SR"
  }];


  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16">

          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Loved by Founders
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands building their next big idea
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) =>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}>

              <Card className="h-full border border-blue-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all bg-white">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) =>
                  <Star key={i} className="w-5 h-5 fill-blue-500 text-blue-500" />
                  )}
                  </div>
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-md">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

};

// FAQ Section
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
  {
    question: "How often will I receive the newsletter?",
    answer: "Every Friday morning, you'll receive a curated digest with 10 validated SaaS ideas. Each issue takes about 5 minutes to read."
  },
  {
    question: "What makes your curation different?",
    answer: "We combine AI-powered discovery with expert human validation. Every idea is scored based on market demand, competition, and growth potential before making it to your inbox."
  },
  {
    question: "Can I unsubscribe anytime?",
    answer: "Absolutely! There's an unsubscribe link in every email. No questions asked, no hard feelings."
  },
  {
    question: "Is it really free?",
    answer: "Yes! The newsletter is 100% free with no hidden costs. We may introduce premium features in the future, but the core weekly digest will always be free."
  },
  {
    question: "Where do you source the ideas from?",
    answer: "We monitor Reddit, Indie Hackers, Product Hunt, Twitter, and dozens of other communities where founders discuss real problems and opportunities."
  },
  {
    question: "What if I want to suggest an idea?",
    answer: "We love community input! Reply to any newsletter email with your suggestion, and our team will review it for a future issue."
  }];


  return (
    <section id="faq" className="py-24 bg-blue-50">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16">

          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) =>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            viewport={{ once: true }}>

              <Card className="border border-blue-200 shadow-sm bg-white overflow-hidden hover:border-blue-300 transition-colors">
                <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-blue-50 transition-colors">

                  <h3 className="text-md font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  {openIndex === index ?
                <Minus className="w-5 h-5 text-blue-600 flex-shrink-0" /> :

                <Plus className="w-5 h-5 text-blue-600 flex-shrink-0" />
                }
                </button>
                <AnimatePresence>
                  {openIndex === index &&
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}>

                      <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                }
                </AnimatePresence>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

};

// Final CTA Section
const FinalCTASection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus({ type: "error", message: "Please enter a valid email" });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch(
        `https://n8n.srv1010179.hstgr.cloud/webhook/v2/saas-radar?query=${encodeURIComponent(email)}`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );

      if (response.ok) {
        setStatus({ type: "success", message: "🎉 Success! Check your inbox for confirmation." });
        setEmail("");
      } else {
        setStatus({ type: "error", message: "Something went wrong" });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Connection error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-blue-500 relative overflow-hidden">
      <BackgroundPatterns />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Catch Your Next SaaS Wave?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join 5,000+ founders and get this Friday's expert-validated issue — free.
          </p>

          <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-6">
            <div className="bg-white rounded-2xl p-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 border-0 focus:ring-0 text-lg px-6 py-4 rounded-xl"
                  disabled={isSubmitting} />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg">

                  {isSubmitting ? "Joining..." : "Subscribe Free"}
                </Button>
              </div>
            </div>
            {status &&
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 text-sm font-medium ${
              status.type === "success" ? "text-white" : "text-blue-100"}`
              }>

                {status.message}
              </motion.div>
            }
          </form>

          <p className="text-blue-100 text-sm">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </motion.div>
      </div>
    </section>);

};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-white border-t border-blue-200 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-md">
                <Radar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">
                Micro-SaaS Space
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Expert-validated SaaS opportunities delivered to your inbox every week.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Newsletter</h4>
            <div className="space-y-2 text-sm">
              <a href="#features" className="block text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="block text-gray-600 hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#sample" className="block text-gray-600 hover:text-blue-600 transition-colors">Sample Issue</a>
              <a href="#testimonials" className="block text-gray-600 hover:text-blue-600 transition-colors">Testimonials</a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Company</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-gray-600 hover:text-blue-600 transition-colors">About</a>
              <a href="#" className="block text-gray-600 hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="block text-gray-600 hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="#" className="block text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Connect</h4>
            <div className="flex gap-3">
              {[Twitter, Linkedin, MessageCircle].map((Icon, index) =>
              <a
                key={index}
                href="#"
                className="w-10 h-10 bg-blue-100 hover:bg-blue-500 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 text-blue-600">

                  <Icon className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-blue-200 text-center text-sm text-gray-600">
          <p>© 2025 Micro-SaaS Space. All rights reserved.</p>
        </div>
      </div>
    </footer>);

};

// Main Component
export default function LandingV3() {
  const formRef = useRef(null);

  const scrollToForm = () => {
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation scrollToForm={scrollToForm} />
      <main>
        <HeroSection scrollToForm={scrollToForm} />
        <SocialProofSection />
        <FeaturesSection />
        <FeaturedIdea />
        <NewsletterSignup/>
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
      <LiveSocialProof/>
    </div>);

}
