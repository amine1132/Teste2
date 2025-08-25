'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

// Variants pour les différents types de transitions
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 20,
  },
  in: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    scale: 1.02,
    y: -20,
  },
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.6,
}

// Overlay fluide pour les transitions
const overlayVariants = {
  initial: {
    scaleX: 0,
  },
  animate: {
    scaleX: 1,
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
  exit: {
    scaleX: 0,
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
      delay: 0.1,
    },
  },
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <div className="relative overflow-hidden">
      {/* Overlay de transition */}
      <motion.div
        className="fixed inset-0 z-50 bg-gradient-to-r from-romantic-pink via-romantic-purple to-romantic-gold origin-left"
        variants={overlayVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ transformOrigin: 'left' }}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="relative z-10"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Hook pour déclencher des transitions personnalisées
export function usePageTransition() {
  const triggerTransition = (callback: () => void, delay: number = 300) => {
    // Déclencher l'effet visuel
    const overlay = document.createElement('div')
    overlay.className = 'fixed inset-0 z-50 bg-gradient-to-r from-romantic-pink via-romantic-purple to-romantic-gold'
    overlay.style.transform = 'scaleX(0)'
    overlay.style.transformOrigin = 'left'
    overlay.style.transition = 'transform 0.4s ease-in-out'
    
    document.body.appendChild(overlay)
    
    // Animation d'entrée
    requestAnimationFrame(() => {
      overlay.style.transform = 'scaleX(1)'
    })
    
    // Exécuter le callback au milieu de la transition
    setTimeout(() => {
      callback()
      
      // Animation de sortie
      setTimeout(() => {
        overlay.style.transformOrigin = 'right'
        overlay.style.transform = 'scaleX(0)'
        
        // Nettoyer l'overlay
        setTimeout(() => {
          document.body.removeChild(overlay)
        }, 400)
      }, 100)
    }, delay)
  }

  return { triggerTransition }
}

