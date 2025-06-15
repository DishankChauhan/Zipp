'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlowingCard } from '@/components/ui/GlowingCard';
import { TestimonialsSection } from '@/components/ui/testimonials-section';
import { StarBorder } from '@/components/ui/star-border';
import { TextRotate } from '@/components/ui/text-rotate';
import { Marquee } from '@/components/ui/marquee';
import { 
  Zap, 
  Shield, 
  Rocket, 
  Globe, 
  ArrowRight, 
  Github, 
  Upload,
  Container,
  Clock,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

const HomePage = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Zap,
      title: 'One-Click Deploy',
      description: 'Deploy your websites instantly with a single click. No complex configurations needed.',
    },
    {
      icon: Container,
      title: 'Docker Powered',
      description: 'Automatic containerization ensures consistent deployments across all environments.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Firebase authentication and isolated containers keep your deployments safe.',
    },
    {
      icon: Globe,
      title: 'Public URLs',
      description: 'Get instant public URLs for your deployed sites with SSL certificates.',
    },
    {
      icon: Github,
      title: 'Git Integration',
      description: 'Deploy directly from GitHub repositories or upload ZIP files.',
    },
    {
      icon: Clock,
      title: 'Real-time Logs',
      description: 'Monitor your deployments with real-time build logs and status updates.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload or Connect',
      description: 'Upload a ZIP file or connect your GitHub repository',
    },
    {
      number: '02',
      title: 'Auto-Configure',
      description: 'Our system automatically detects and configures your project',
    },
    {
      number: '03',
      title: 'Deploy & Share',
      description: 'Get a live URL in seconds and share your project with the world',
    },
  ];

  const leftLinks = [
    { href: '/about', label: 'About' },
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/docs', label: 'Documentation' },
  ];

  const rightLinks = [
    { href: '/support', label: 'Support' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ];

  const testimonials = [
    {
      author: {
        name: "Sarah Chen",
        handle: "@sarahdev",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
      },
      text: "Zipp made deploying my React apps so simple. What used to take hours now takes seconds!"
    },
    {
      author: {
        name: "Marcus Johnson",
        handle: "@marcusbuilds",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      text: "The Docker integration is seamless. I can focus on coding instead of deployment configs."
    },
    {
      author: {
        name: "Elena Rodriguez",
        handle: "@elenacode",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
      },
      text: "Best deployment platform I've used. The real-time logs are incredibly helpful for debugging."
    },
    {
      author: {
        name: "David Kim",
        handle: "@davidtech",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      text: "One-click GitHub integration saved me so much time. Zipp is a game-changer!"
    },
    {
      author: {
        name: "Lisa Wang",
        handle: "@lisaweb",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
      },
      text: "The public URLs with SSL certificates work perfectly. My clients love the instant previews."
    },
    {
      author: {
        name: "Alex Thompson",
        handle: "@alexfullstack",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
      },
      text: "Zipp's containerization ensures my apps run consistently everywhere. Absolutely brilliant!"
    }
  ];

  // Dynamic text variations for the rotating heading
  const rotatingTexts = [
    "Instantly",
    "Effortlessly", 
    "Seamlessly",
    "Lightning Fast",
    "In Seconds"
  ];

  // Website examples for the marquee
  const websiteExamples = [
    { name: "Portfolio Sites", tech: "React", color: "from-blue-400 to-cyan-400" },
    { name: "E-commerce Stores", tech: "Next.js", color: "from-purple-400 to-pink-400" },
    { name: "Landing Pages", tech: "Vue.js", color: "from-green-400 to-emerald-400" },
    { name: "Blog Platforms", tech: "Gatsby", color: "from-orange-400 to-red-400" },
    { name: "SaaS Applications", tech: "Angular", color: "from-indigo-400 to-purple-400" },
    { name: "Documentation Sites", tech: "Docusaurus", color: "from-teal-400 to-blue-400" },
    { name: "API Dashboards", tech: "Svelte", color: "from-pink-400 to-rose-400" },
    { name: "Mobile Apps", tech: "React Native", color: "from-yellow-400 to-orange-400" },
  ];

  return (
    <AnimatedBackground>
      <div className="min-h-screen">
        <Header />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="mb-8"
              >
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  Deploy Websites
                  <br />
                  <TextRotate
                    texts={rotatingTexts}
                    rotationInterval={3000}
                    staggerDuration={0.05}
                    staggerFrom="first"
                    splitBy="characters"
                    transition={{ 
                      type: "spring", 
                      damping: 20, 
                      stiffness: 200,
                      duration: 0.6
                    }}
                    initial={{ y: "100%", opacity: 0, rotateX: 90 }}
                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                    exit={{ y: "-100%", opacity: 0, rotateX: -90 }}
                    mainClassName="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent inline-block"
                    elementLevelClassName="transform-gpu"
                  />
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  One-click website deployment with Docker containerization. 
                  Upload your code and get a live URL in seconds.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
              >
                {user ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <StarBorder 
                      as="a" 
                      href="/dashboard"
                      color="#3b82f6"
                      speed="4s"
                      className="font-semibold text-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <span>Go to Dashboard</span>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </StarBorder>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <StarBorder 
                        as="a" 
                        href="/auth?mode=signup"
                        color="#3b82f6"
                        speed="4s"
                        className="font-semibold text-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <span>Get Started Free</span>
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </StarBorder>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <StarBorder 
                        as="a" 
                        href="/auth"
                        color="#6b7280"
                        speed="5s"
                        className="font-semibold text-lg"
                      >
                        Sign In
                      </StarBorder>
                    </motion.div>
                  </>
                )}
              </motion.div>

              {/* Demo Preview */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                className="relative max-w-4xl mx-auto"
              >
                <GlowingCard>
                  <div className="bg-black/95 border-2 border-gray-800 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-500">
                    <div className="bg-gray-900 rounded-t-xl p-4 flex items-center space-x-2 border-b border-gray-800">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="text-white text-sm font-mono">zipp.dev</div>
                    </div>
                    <div className="p-8">
                      <div className="text-center">
                        <Upload className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                        <p className="text-gray-200 text-lg font-medium">Drop your files here or connect GitHub</p>
                        <div className="mt-6 flex justify-center space-x-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-300">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span>React</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-300">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span>Node.js</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-300">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span>Python</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlowingCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Choose Zipp?
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Built for developers who want to focus on coding, not deployment complexity.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="h-full"
                >
                  <GlowingCard className="h-full">
                    <div className="bg-black/95 border-2 border-gray-800 p-6 rounded-xl hover:bg-black hover:border-gray-700 transition-all duration-500 group h-full flex flex-col">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="p-3 bg-transparent rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0 relative">
                          <feature.icon className="h-6 w-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-300" />
                          <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2 leading-tight">{feature.title}</h3>
                        </div>
                      </div>
                      <p className="text-gray-200 leading-relaxed text-sm flex-1">{feature.description}</p>
                    </div>
                  </GlowingCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                How It Works
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Deploy your website in three simple steps.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center relative"
                >
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-transparent border-2 border-white/30 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative group hover:scale-110 transition-all duration-300">
                      <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-300">{step.number}</span>
                      <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-white/20 -z-10" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Website Examples Marquee Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Deploy Websites
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Instantly</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                From simple portfolios to complex applications - deploy any type of website with ease.
              </p>
            </motion.div>

            <Marquee pauseOnHover speed={40} className="mt-16">
              {websiteExamples.map((example, index) => (
                <div
                  key={index}
                  className="mx-4 p-6 bg-black/60 border border-gray-700 rounded-xl backdrop-blur-sm hover:bg-black/80 transition-all duration-300 group min-w-[280px]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${example.color}`}></div>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{example.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Built with</span>
                    <span className={`text-sm font-medium bg-gradient-to-r ${example.color} bg-clip-text text-transparent`}>
                      {example.tech}
                    </span>
                  </div>
                </div>
              ))}
            </Marquee>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-blue-900/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to Deploy?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of developers who trust Zipp for their deployment needs.
              </p>
              {!user && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <StarBorder 
                    as="a" 
                    href="/auth?mode=signup"
                    color="#ffffff"
                    speed="3s"
                    className="font-semibold text-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <span>Start Deploying Now</span>
                      <Rocket className="h-5 w-5" />
                    </div>
                  </StarBorder>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <TestimonialsSection
          title="Loved by Developers Worldwide"
          description="See what developers are saying about their experience with Zipp"
          testimonials={testimonials}
        />

        {/* Animated Footer */}
        <Footer
          leftLinks={leftLinks}
          rightLinks={rightLinks}
          copyrightText="© 2024 Zipp. Built with ❤️ for developers."
          barCount={25}
        />
      </div>
    </AnimatedBackground>
  );
};

export default HomePage;
