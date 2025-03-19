"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Instagram, Github, Mail, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlowBorder, SpotlightEffect } from "@/components/ui/lighting-effects"

export function Footer() {
  const [hovered, setHovered] = useState('')
  
  const currentYear = new Date().getFullYear()
  
  const animatedLinkVariants = {
    initial: { y: 0 },
    hover: { y: -3, transition: { duration: 0.2 } }
  }
  
  const fadeInUpVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  return (
    <footer className="mt-auto pt-12 pb-6 border-t noise-bg relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/95 opacity-80" />
      
      <div className="container px-4 mx-auto relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
          {/* Brand column */}
          <motion.div 
            className="flex flex-col space-y-4"
            initial="initial"
            animate="animate"
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            <motion.div variants={fadeInUpVariants} className="flex items-center space-x-2">
              <div className="font-bold text-xl text-primary glow-text">KR Community</div>
            </motion.div>
            
            <motion.div variants={fadeInUpVariants} className="text-muted-foreground text-sm max-w-xs">
              Connecting college students through events, shared interests, and meaningful interactions.
            </motion.div>
            
            <motion.div variants={fadeInUpVariants} className="flex space-x-3 mt-2">
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <motion.div 
                  variants={animatedLinkVariants}
                  initial="initial"
                  whileHover="hover"
                  className="p-2 rounded-full bg-muted/50 hover:bg-primary/10 text-foreground/80 hover:text-primary transition-colors"
                >
                  <Instagram size={18} />
                </motion.div>
              </Link>
              
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                <motion.div 
                  variants={animatedLinkVariants}
                  initial="initial"
                  whileHover="hover"
                  className="p-2 rounded-full bg-muted/50 hover:bg-primary/10 text-foreground/80 hover:text-primary transition-colors"
                >
                  <Github size={18} />
                </motion.div>
              </Link>
              
              <Link href="mailto:contact@college-community.com">
                <motion.div 
                  variants={animatedLinkVariants}
                  initial="initial"
                  whileHover="hover"
                  className="p-2 rounded-full bg-muted/50 hover:bg-primary/10 text-foreground/80 hover:text-primary transition-colors"
                >
                  <Mail size={18} />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Sitemap column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-semibold text-base mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: 'Home', path: '/' },
                { name: 'Events', path: '/events' },
                { name: 'Community', path: '/community' },
                { name: 'Dashboard', path: '/dashboard' },
                { name: 'About Us', path: '/about' }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.path} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    onMouseEnter={() => setHovered(link.name)}
                    onMouseLeave={() => setHovered('')}
                  >
                    <div className="flex items-center">
                      <div className="relative overflow-hidden">
                        <span className={`transform transition-transform duration-300 ${hovered === link.name ? 'translate-y-[-100%]' : 'translate-y-0'}`}>
                          {link.name}
                        </span>
                        <span className={`absolute top-0 left-0 transform transition-transform duration-300 text-primary ${hovered === link.name ? 'translate-y-0' : 'translate-y-[100%]'}`}>
                          {link.name}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Newsletter column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="font-semibold text-base mb-4">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Get notified about new events and community happenings.
            </p>
            
            <div>
              <SpotlightEffect size="40rem" strength={0.05}>
                <GlowBorder className="rounded-lg" animated={false}>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90" 
                    variant="default"
                  >
                    Subscribe to Updates
                  </Button>
                </GlowBorder>
              </SpotlightEffect>
            </div>
          </motion.div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
          <motion.div 
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            © {currentYear} KR Community. All rights reserved.
          </motion.div>
          
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={scrollToTop}
            >
              <ArrowUp size={18} />
              <span className="sr-only">Scroll to top</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </footer>
  )
} 