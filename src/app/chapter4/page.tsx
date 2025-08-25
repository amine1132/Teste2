'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import Link from 'next/link'
import { triggerEasterEgg } from '@/utils/easterEggs'

// Galaxie de l'amour éternel
function LoveGalaxy() {
  const ref = useRef<THREE.Points>(null)
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(3000 * 3)
    
    for (let i = 0; i < 3000; i++) {
      // Création d'une spirale galactique
      const angle = (i / 3000) * Math.PI * 4
      const radius = (i / 3000) * 8 + Math.random() * 2
      
      positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 2
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4
      positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 2
    }
    
    return positions
  }, [])
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.1
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    }
  })

  return (
    <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#fbbf24"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  )
}



export default function Chapter4() {
  const [easterEggSolved, setEasterEggSolved] = useState(false)
  const [showBirthdayMessage, setShowBirthdayMessage] = useState(false)
  const [isPuzzleActive, setIsPuzzleActive] = useState(false)
  const [puzzleAttempts, setPuzzleAttempts] = useState(0)
  const [currentInput, setCurrentInput] = useState('')
  
  // Code secret : sa date de naissance 21/08/2002
  const secretCode = '21082002'
  
  useEffect(() => {
    if (easterEggSolved && !showBirthdayMessage) {
      setShowBirthdayMessage(true)
      setTimeout(() => setShowBirthdayMessage(false), 5000)
    }
  }, [easterEggSolved, showBirthdayMessage])
  
  const handleInputChange = (value: string) => {
    setCurrentInput(value)
  }
  
  const handleSubmit = () => {
    if (currentInput === secretCode) {
      setEasterEggSolved(true)
      setIsPuzzleActive(false)
      setCurrentInput('')
    } else {
      setCurrentInput('')
      setPuzzleAttempts(prev => prev + 1)
      if (puzzleAttempts >= 2) {
        setIsPuzzleActive(false)
        setCurrentInput('')
        setPuzzleAttempts(0)
      }
    }
  }
  
  const activatePuzzle = () => {
    setIsPuzzleActive(true)
    setCurrentInput('')
    setPuzzleAttempts(0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: 90 }}
      animate={{ opacity: 1, rotateY: 0 }}
      exit={{ opacity: 0, rotateY: -90 }}
      transition={{ duration: 1 }}
      className="relative w-full h-screen bg-gradient-to-br from-romantic-gold/10 via-romantic-purple/5 to-romantic-pink/10"
    >
      {/* Canvas Three.js */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.3 } />
          <pointLight position={[0, 0, 0]} intensity={2} color="#fbbf24" />
          <LoveGalaxy />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.1} />
        </Canvas>
      </div>

      {/* Message d'anniversaire popup */}
      <AnimatePresence>
        {showBirthdayMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-br from-romantic-pink to-romantic-gold p-8 rounded-3xl text-center shadow-2xl border-4 border-white/30"
            >
              <h2 className="text-4xl font-bold text-white mb-4">🎉🎂🎉</h2>
              <p className="text-2xl font-bold text-white leading-relaxed">
                Bodi pouet pouet<br/>
                <span className="text-3xl">Bonne anniversaire mon amour</span> 💕
              </p>
              <motion.button
                onClick={() => setShowBirthdayMessage(false)}
                className="mt-6 px-6 py-3 bg-white/20 text-white rounded-full font-medium hover:bg-white/30 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Fermer
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenu de la page */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="p-8">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-5xl md:text-6xl font-bold romantic-text-gradient text-center"
          >
            Notre Éternité
          </motion.h1>
          <motion.p
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-4 text-lg text-foreground/80"
          >
            L&apos;avenir que nous construisons ensemble, jour après jour...
          </motion.p>
        </header>

        {/* Zone centrale */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 max-w-3xl mx-auto text-center border border-white/20 relative"
          >
            <h2 className="font-display text-3xl mb-6 text-romantic-gold">
              À travers l&apos;infini
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-8">
              Notre amour grandit chaque jour, se transforme et s&apos;approfondit. 
              Ensemble, nous écrivons les plus belles pages de notre histoire, 
              créant des souvenirs qui dureront pour l&apos;éternité...
            </p>
            
            {/* Message spécial */}
            <motion.div
              className="bg-gradient-to-r from-romantic-pink/20 to-romantic-gold/20 rounded-2xl p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <p className="font-display text-xl text-primary italic">
                &ldquo;Je t&apos;aime aujourd&apos;hui plus qu&apos;hier, et bien moins que demain.&rdquo;
              </p>
            </motion.div>
            
            {/* Interaction finale avec digicode simple */}
            <motion.div
              className="flex flex-col items-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {!isPuzzleActive && !easterEggSolved && (
                <motion.button
                  onClick={activatePuzzle}
                  className="px-6 py-3 bg-gradient-to-r from-romantic-pink to-romantic-purple text-white rounded-full font-medium hover:from-romantic-purple hover:to-romantic-pink transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎁 Découvrir le secret
                </motion.button>
              )}
              
              {isPuzzleActive && (
                <div className="text-center mb-6">
                  <p className="text-romantic-gold font-medium mb-4">
                    🔐 Entrez le code secret
                  </p>
                  {puzzleAttempts > 0 && (
                    <p className="text-sm text-romantic-pink mb-4">
                      Tentatives: {puzzleAttempts}/3
                    </p>
                  )}
                  
                  {/* Digicode */}
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <input
                      type="password"
                      value={currentInput}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="••••••••"
                      maxLength={8}
                      className="w-32 h-12 text-center text-xl font-bold bg-white/20 border-2 border-romantic-gold/50 rounded-lg text-romantic-gold placeholder-foreground/40 focus:outline-none focus:border-romantic-gold focus:bg-white/30 tracking-widest"
                    />
                    <motion.button
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-romantic-gold text-white rounded-lg font-medium hover:bg-romantic-gold/80 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Entrer
                    </motion.button>
                  </div>
                </div>
              )}
              
              {easterEggSolved && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-gradient-to-r from-romantic-gold/30 to-romantic-pink/30 rounded-2xl"
                >
                  <p className="text-romantic-gold font-bold text-lg">
                    🎉 Bravo ! Tu as trouvé le code secret ! 🎉
                  </p>
                </motion.div>
              )}
            </motion.div>
            
            {/* Easter Egg final caché */}
            <motion.button
              className="absolute bottom-2 right-2 opacity-5 hover:opacity-100 transition-all duration-1000 text-lg interactive"
              onClick={() => triggerEasterEgg(4)}
              whileHover={{ scale: 1.5, rotate: 720 }}
              transition={{ duration: 1 }}
            >
              🌟
            </motion.button>
          </motion.div>
        </div>

        {/* Navigation finale */}
        <nav className="p-8 flex justify-between items-center">
          <Link href="/chapter3">
            <motion.button
              className="px-6 py-3 bg-romantic-gold/20 text-romantic-gold rounded-full font-medium interactive"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Précédent
            </motion.button>
          </Link>
          
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-foreground/20 rounded-full"></div>
            <div className="w-3 h-3 bg-foreground/20 rounded-full"></div>
            <div className="w-3 h-3 bg-foreground/20 rounded-full"></div>
            <div className="w-3 h-3 bg-romantic-gold rounded-full"></div>
          </div>
          
          <Link href="/intro">
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-romantic-pink to-romantic-gold text-white rounded-full font-medium hover:from-romantic-purple hover:to-romantic-pink transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ↻ Recommencer
            </motion.button>
          </Link>
        </nav>
      </div>
    </motion.div>
  )
}
