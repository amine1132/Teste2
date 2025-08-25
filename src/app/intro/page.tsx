'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { useRouter } from 'next/navigation'
import CinematicParticles from '@/components/CinematicParticles'
import { AnimatePresence } from 'framer-motion'

// Composant pour les particules d'arrière-plan
function ParticleField() {
  return (
    <>
      <Stars radius={300} depth={60} count={5000} factor={7} saturation={0} fade speed={1} />
      <ambientLight intensity={0.5} />
    </>
  )
}

export default function IntroPage() {
  const [showName, setShowName] = useState(false)
  const [showSubtitle, setShowSubtitle] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [nameTouched, setNameTouched] = useState(false)
  const router = useRouter()
  
  // Remplace par le prénom de ton amoureuse
  const loverName = "Nerymene" // ← Modifie ici
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowName(true)
    }, 800)
    
    const subtitleTimer = setTimeout(() => {
      setShowSubtitle(true)
    }, 3000)
    
    // Gestion de la souris
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    // Gestion des événements tactiles pour iPad Pro
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setMousePosition({ 
          x: e.touches[0].clientX, 
          y: e.touches[0].clientY 
        })
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    
    return () => {
      clearTimeout(timer)
      clearTimeout(subtitleTimer)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  const handleStart = () => {
    router.push('/chapter1')
  }

  return (
    <div className="relative w-full h-screen overflow-hidden animated-bg">
      {/* Particules cinématiques */}
      <CinematicParticles 
        theme="love" 
        interactive={true}
        mousePosition={mousePosition}
      />
      
      {/* Overlay avec gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/40 z-5" />
      
      {/* Contenu principal */}
      <div className="relative z-10 flex items-center justify-center h-full px-8">
        <div className="text-center max-w-4xl">
          {/* Titre principal avec effet de révélation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showName ? 1 : 0 }}
            transition={{ duration: 1.5 }}
          >
            <motion.h1 
              className="font-display text-7xl md:text-9xl lg:text-[11rem] font-bold text-white text-glow"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {loverName.split('').map((letter, index) => (
                <motion.span
                  key={index}
                  className="inline-block cursor-pointer"
                  initial={{ opacity: 0, y: 100, rotateX: -90 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    rotateX: 0,
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.15 + 1,
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{
                    scale: 1.1,
                    color: '#ff69b4',
                    textShadow: '0 0 30px rgba(255,105,180,0.8)',
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{
                    scale: 0.95,
                    color: '#ff1493',
                    textShadow: '0 0 40px rgba(255,20,147,0.9)',
                    transition: { duration: 0.1 }
                  }}
                  onTouchStart={() => {
                    // Effet spécial au toucher sur iPad Pro
                    setNameTouched(true)
                    setTimeout(() => setNameTouched(false), 2000)
                    console.log(`Touche sur la lettre ${letter} !`)
                  }}
                  onClick={() => {
                    // Effet au clic (pour PC et iPad Pro)
                    setNameTouched(true)
                    setTimeout(() => setNameTouched(false), 2000)
                    console.log(`Clic sur la lettre ${letter} !`)
                  }}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
            </motion.h1>
            
            {/* Effet de particules sous le nom */}
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 mt-4"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3, duration: 1 }}
            >
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-romantic-pink to-transparent" />
            </motion.div>
            
            {/* Effet spécial quand le prénom est touché */}
            <AnimatePresence>
              {nameTouched && (
                <motion.div
                  className="absolute left-1/2 transform -translate-x-1/2 mt-8"
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 360]
                      }}
                      transition={{ duration: 1.5, repeat: 2 }}
                      className="text-6xl mb-4"
                    >
                      ✨💖✨
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-romantic-pink text-lg font-medium bg-black/30 backdrop-blur-sm px-6 py-3 rounded-full border border-romantic-pink/30"
                    >
                      Mon amour éternel ! 💕
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Sous-titre élégant */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: showSubtitle ? 1 : 0,
              y: showSubtitle ? 0 : 30 
            }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="mt-12"
          >
            <p className="text-2xl md:text-3xl text-white/90 font-light tracking-wide">
              Une symphonie d&apos;amour
            </p>
            <p className="text-lg md:text-xl text-white/70 mt-2 font-light">
              en quatre mouvements éternels
            </p>
          </motion.div>

          {/* Zone interactive pour commencer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: showSubtitle ? 1 : 0, scale: showSubtitle ? 1 : 0.8 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-16"
          >
            <motion.button
              onClick={handleStart}
              className="group relative px-12 py-6 bg-black/20 backdrop-blur-xl rounded-full border border-white/20 text-white font-medium text-lg overflow-hidden touch-feedback"
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 0 40px rgba(236,72,153,0.4)',
                borderColor: 'rgba(236,72,153,0.6)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Effet de shimmer */}
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <span className="relative z-10 flex items-center space-x-3">
                <span>Commencer notre histoire</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ✨
                </motion.span>
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>
      
      {/* Indicateur de scroll animé */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSubtitle ? 1 : 0 }}
        transition={{ delay: 3 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        onClick={handleStart}
      >
        <div className="text-center">
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="w-8 h-12 border-2 border-white/40 rounded-full flex justify-center relative overflow-hidden"
          >
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="w-2 h-2 bg-romantic-pink rounded-full mt-3 shadow-lg"
              style={{
                boxShadow: '0 0 10px rgba(236,72,153,0.8)'
              }}
            />
          </motion.div>
          <p className="mt-3 text-sm text-white/60 font-light">
            Laisse ton cœur guider le curseur
          </p>
        </div>
      </motion.div>
    </div>
  )
}
