"use client"
import React, { useEffect, useRef, useState } from "react";
import { Zap } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface LinkItem {
  href: string;
  label: string;
}

interface FooterProps {
  leftLinks: LinkItem[];
  rightLinks: LinkItem[];
  copyrightText: string;
  barCount?: number; 
}

const Footer: React.FC<FooterProps> = ({
  leftLinks,
  rightLinks,
  copyrightText,
  barCount = 23, 
}) => {
  const waveRefs = useRef<(HTMLDivElement | null)[]>([]);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 } 
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);


  useEffect(() => {
    let t = 0; 

    const animateWave = () => {
      const waveElements = waveRefs.current;
      let offset = 0;

      waveElements.forEach((element, index) => {
        if (element) {
          offset += Math.max(0, 20 * Math.sin((t + index) * 0.3)); 
          element.style.transform = `translateY(${index + offset}px)`;
        }
      });

      t += 0.1;
      animationFrameRef.current = requestAnimationFrame(animateWave);
    };

    if (isVisible) {
      animateWave();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isVisible]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      ref={footerRef}
      className="bg-black text-white relative flex flex-col w-full justify-between lg:min-h-screen select-none"
    >
      <div className="container mx-auto flex flex-col md:flex-row justify-between w-full gap-6 pb-32 pt-16 px-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-6">
            <Image
              src="/zipp logo.png"
              alt="Zipp"
              width={360}
              height={144}
              className="h-36 w-auto"
            />
          </div>
          <ul className="flex flex-wrap gap-6">
            {leftLinks.map((link, index) => (
              <li key={index}>
                <Link
                  href={link.href}
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300 font-medium"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-sm mt-6 text-gray-400">
            {copyrightText}
          </p>
        </div>
        <div className="space-y-6">
          <ul className="flex flex-wrap gap-6 justify-start md:justify-end">
            {rightLinks.map((link, index) => (
              <li key={index}>
                <Link
                  href={link.href}
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300 font-medium"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="text-left md:text-right">
            <button 
              onClick={scrollToTop}
              className="text-sm hover:text-blue-400 transition-colors duration-300 inline-flex items-center group"
            >
              <span>Back to top</span>
              <svg className="ml-1 h-4 w-4 transform group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div
        id="waveContainer"
        aria-hidden="true"
        style={{ overflow: "hidden", height: 200 }}
        className="relative"
      >
        <div style={{ marginTop: 0 }}>
          {Array.from({ length: barCount }).map((_, index) => (
            <div
              key={index}
              ref={(el) => { waveRefs.current[index] = el; }}
              className="wave-segment"
              style={{
                height: `${index + 1}px`,
                backgroundColor: `hsl(${200 + index * 8}, 70%, ${50 + index * 2}%)`,
                transition: "transform 0.1s ease",
                willChange: "transform",
                marginTop: "-2px",
              }}
            />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer; 