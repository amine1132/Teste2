'use client'

import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Points, PointMaterial, Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import Link from 'next/link'
import { triggerEasterEgg } from '@/utils/easterEggs'

// Particules d'engagement optimisées avec throttling
function EngagementParticles() {
  const ref = useRef<THREE.Points>(null)
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const isInteractingRef = useRef(false)
  const lastUpdateRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isTouchDeviceRef = useRef(false)
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(1000 * 3) // Réduit de 2000 à 1000 pour la performance
    
    for (let i = 0; i < 1000; i++) {
      const angle = (i / 1000) * Math.PI * 6
      const radius = (i / 1000) * 6 + Math.random() * 1.5
      
      positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 1
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3
      positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 1
    }
    
    return positions
  }, [])
  
  useFrame((state) => {
    // Ajuster les FPS selon l'appareil
    const targetFPS = isTouchDeviceRef.current ? 0.032 : 0.016 // 30 FPS sur tactile, 60 FPS sur desktop
    
    if (ref.current && state.clock.elapsedTime - lastUpdateRef.current > targetFPS) {
      lastUpdateRef.current = state.clock.elapsedTime
      
      ref.current.rotation.y = state.clock.elapsedTime * 0.1 // Réduit de 0.15 à 0.1
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05 // Réduit de 0.1 à 0.05
      
      // Effet de vague optimisé
      const mouseInfluence = (mousePositionRef.current.x / window.innerWidth - 0.5) * 0.3
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.05 + mouseInfluence
      
      // Effet de dispersion optimisé
      if (isInteractingRef.current) {
        ref.current.scale.setScalar(1.1) // Réduit de 1.2 à 1.1
        ref.current.rotation.y += 0.05 // Réduit de 0.1 à 0.05
      } else {
        ref.current.scale.setScalar(1)
      }
    }
  })

  useEffect(() => {
    // Détecter si c'est un appareil tactile
    isTouchDeviceRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY }
      
      if (!isInteractingRef.current) {
        isInteractingRef.current = true
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          isInteractingRef.current = false
        }, 200)
      }
    }
    
    const handleClick = () => {
      isInteractingRef.current = true
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        isInteractingRef.current = false
      }, 300)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        const touch = e.touches[0]
        mousePositionRef.current = { x: touch.clientX, y: touch.clientY }
        
        if (!isInteractingRef.current) {
          isInteractingRef.current = true
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          timeoutRef.current = setTimeout(() => {
            isInteractingRef.current = false
          }, 200)
        }
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      isInteractingRef.current = true
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        isInteractingRef.current = false
      }, 300)
    }
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('click', handleClick, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchstart', handleTouchStart)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, []) // Dépendances vides

  return (
    <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={true}>
      <PointMaterial
        transparent
        color="#fbbf24"
        size={0.06}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  )
}

// Texte 3D flottant optimisé
function FloatingText() {
  const textRef = useRef<THREE.Group>(null)
  const isHoveredRef = useRef(false)
  const lastUpdateRef = useRef(0)
  
  useFrame((state) => {
    if (textRef.current && state.clock.elapsedTime - lastUpdateRef.current > 0.032) { // 30 FPS max
      lastUpdateRef.current = state.clock.elapsedTime
      
      textRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3
      textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
      
      if (isHoveredRef.current) {
        textRef.current.scale.setScalar(1.3)
        textRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1) * 0.1
      } else {
        textRef.current.scale.setScalar(1)
        textRef.current.rotation.z = 0
      }
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
      <group 
        ref={textRef} 
        position={[0, 2, 0]}
        onPointerOver={() => { isHoveredRef.current = true }}
        onPointerOut={() => { isHoveredRef.current = false }}
      >
        <Text
          position={[0, 0, 0]}
          fontSize={1.2}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
          font="/fonts/PlayfairDisplay-Bold.woff"
        >
          💍
        </Text>
      </group>
    </Float>
  )
}

// Particules réactives au clavier optimisées
function KeyboardParticles() {
  const keysRef = useRef<Set<string>>(new Set())
  const particlesRef = useRef<THREE.Points>(null)
  const lastUpdateRef = useRef(0)
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(300 * 3) // Réduit de 500 à 300
    for (let i = 0; i < 300; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15
    }
    return positions
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key)
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key)
    }
    
    window.addEventListener('keydown', handleKeyDown, { passive: true })
    window.addEventListener('keyup', handleKeyUp, { passive: true })
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, []) // Dépendances vides

  useFrame((state) => {
    if (particlesRef.current && state.clock.elapsedTime - lastUpdateRef.current > 0.032) {
      lastUpdateRef.current = state.clock.elapsedTime
      
      if (keysRef.current.size > 0) {
        particlesRef.current.rotation.y += 0.03
        particlesRef.current.rotation.x += 0.02
        particlesRef.current.scale.setScalar(1.1)
      } else {
        particlesRef.current.scale.setScalar(1)
      }
    }
  })

  if (keysRef.current.size === 0) return null

  return (
    <Points ref={particlesRef} positions={particlesPosition} stride={3} frustumCulled={true}>
      <PointMaterial
        transparent
        color="#ec4899"
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  )
}

export default function Chapter3() {
  const [isHovering, setIsHovering] = useState(false)
  const [particleCount, setParticleCount] = useState(0)
  const [showLoveMessage, setShowLoveMessage] = useState(false)
  const [interactionLevel, setInteractionLevel] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [showSecretMessage, setShowSecretMessage] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [isInputVisible, setIsInputVisible] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]) // Réduit de 15 à 10
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]) // Réduit de 15 à 10

  // Référence pour l'audio
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Référence pour le throttling de la souris
  const lastMouseUpdateRef = useRef(0)
  const cursorPositionRef = useRef({ x: 0, y: 0 })
  const isTouchDeviceRef = useRef(false)

  // Effet de parallaxe au mouvement de la souris optimisé
  useEffect(() => {
    // Détecter si c'est un appareil tactile
    isTouchDeviceRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastMouseUpdateRef.current > 8) { // 120 FPS pour plus de fluidité
        lastMouseUpdateRef.current = now
        
        // Utiliser les refs pour éviter les re-renders
        cursorPositionRef.current = { x: e.clientX, y: e.clientY }
        
        // Mettre à jour les valeurs de motion sans déclencher de re-render
        mouseX.set(e.clientX - window.innerWidth / 2)
        mouseY.set(e.clientY - window.innerHeight / 2)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      const now = Date.now()
      if (now - lastMouseUpdateRef.current > 8) { // 120 FPS pour plus de fluidité
        lastMouseUpdateRef.current = now
        
        if (e.touches[0]) {
          const touch = e.touches[0]
          cursorPositionRef.current = { x: touch.clientX, y: touch.clientY }
          
          // Mettre à jour les valeurs de motion sans déclencher de re-render
          mouseX.set(touch.clientX - window.innerWidth / 2)
          mouseY.set(touch.clientY - window.innerHeight / 2)
        }
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) {
        const touch = e.touches[0]
        cursorPositionRef.current = { x: touch.clientX, y: touch.clientY }
        
        // Mettre à jour les valeurs de motion sans déclencher de re-render
        mouseX.set(touch.clientX - window.innerWidth / 2)
        mouseY.set(touch.clientY - window.innerHeight / 2)
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchstart', handleTouchStart)
    }
  }, []) // Dépendances vides

  // Animation progressive des particules optimisée
  useEffect(() => {
    const timer = setInterval(() => {
      setParticleCount(prev => {
        if (prev < 50) return prev + 1 // Réduit de 100 à 50
        return prev
      })
    }, 100) // Augmenté de 50 à 100ms

    const messageTimer = setTimeout(() => setShowLoveMessage(true), 3000)

    // Stockage des timers pour nettoyage
    const cleanup = () => {
      clearInterval(timer)
      clearTimeout(messageTimer)
    }

    return cleanup
  }, []) // Dépendances vides pour éviter les re-créations

  // Interaction au clavier optimisée
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'l' || e.key === 'L') {
        setShowSecretMessage(true)
        setTimeout(() => setShowSecretMessage(false), 3000)
      }
      
      if (e.key === 't' || e.key === 'T') {
        setIsTyping(true)
        setIsInputVisible(true)
        setUserInput("")
      }
    }
    
    // Gestion des événements tactiles pour iPad Pro
    const handleTouchStart = (e: TouchEvent) => {
      // Détecter un double tap pour ouvrir l'interface de saisie
      const now = Date.now()
      if (now - (handleTouchStart as { lastTap?: number }).lastTap! < 300) {
        setIsTyping(true)
        setIsInputVisible(true)
        setUserInput("")

      }
      (handleTouchStart as { lastTap?: number }).lastTap = now
    }
    
    window.addEventListener('keydown', handleKeyDown, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('touchstart', handleTouchStart)
    }
  }, []) // Dépendances vides

  // Fonction pour arrêter la musique optimisée
  const stopLoveMusic = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.pause()
        setIsMusicPlaying(false)
      }
    } catch (error) {
      console.log('Erreur lors de l\'arrêt de la musique:', error)
      setIsMusicPlaying(false)
    }
  }, [])

  // Gérer la soumission du message optimisée
  const handleMessageSubmit = useCallback(() => {
    try {
      if (userInput.trim()) {
        setTypedText(userInput.trim())
        setIsInputVisible(false)
        
        // Lancer la musique DADJU - Reine quand le message est envoyé
        if (audioRef.current) {
          audioRef.current.src = "/music/DADJU - Reine (Clip Officiel).mp3"
          audioRef.current.load() // Recharger l'audio avec la nouvelle source
          audioRef.current.play().catch(error => {
            console.log('Musique non disponible:', error)
            setIsMusicPlaying(false)
          })
          setIsMusicPlaying(true)
        }
        
        setTimeout(() => {
          setIsTyping(false)
          setTypedText("")
          stopLoveMusic()
        }, 5000)
      }
    } catch (error) {
      console.log('Erreur lors de la soumission du message:', error)
      setIsTyping(false)
      setIsInputVisible(false)
      stopLoveMusic()
    }
  }, [userInput, stopLoveMusic])

  // Gérer la touche Entrée optimisée
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    try {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleMessageSubmit()
      }
    } catch (error) {
      console.log('Erreur lors de la gestion des touches:', error)
    }
  }, [handleMessageSubmit])

  // Gérer la fermeture de l'interface optimisée
  const handleCloseInterface = useCallback(() => {
    try {
      setIsTyping(false)
      setIsInputVisible(false)
      setUserInput("")
      stopLoveMusic()
    } catch (error) {
      console.log('Erreur lors de la fermeture:', error)
      setIsTyping(false)
      setIsInputVisible(false)
    }
  }, [stopLoveMusic])

  // Augmenter le niveau d'interaction avec le temps optimisé
  useEffect(() => {
    const timer = setInterval(() => {
      setInteractionLevel(prev => Math.min(prev + 1, 100))
    }, 2000) // Augmenté de 1000 à 2000ms
    
    return () => clearInterval(timer)
  }, []) // Dépendances vides

  const handleCardInteraction = useCallback(() => {
    setInteractionLevel(prev => Math.min(prev + 10, 100))
  }, [])

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      // Nettoyage des effets DOM si nécessaire
      if (document.body.style.filter) {
        document.body.style.filter = 'none'
      }
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="relative w-full h-screen overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
          linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)
        `
      }}
    >
      {/* Audio pour la musique d'amour */}
      <audio
        ref={audioRef}
        preload="auto"
        loop
        onEnded={() => setIsMusicPlaying(false)}
        onError={() => {
          console.log('Erreur audio: fichier non trouvé')
          setIsMusicPlaying(false)
        }}
        onLoadStart={() => console.log('Chargement audio...')}
        onCanPlay={() => console.log('Audio prêt à jouer')}
      />

      {/* Curseur personnalisé optimisé */}
      <motion.div
        className="fixed w-5 h-5 bg-gradient-to-r from-amber-400 to-pink-400 rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{ 
          left: cursorPositionRef.current.x - 10, 
          top: cursorPositionRef.current.y - 10,
          transform: 'translate3d(0, 0, 0)', // Force l'accélération matérielle
          willChange: 'transform', // Optimise les performances
          transition: isTouchDeviceRef.current ? 'none' : 'all 0.05s ease-out' // Pas de transition sur tactile
        }}
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Effet de particules flottantes optimisé */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 25 }).map((_, i) => ( // Réduit de 50 à 25
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-amber-400 to-pink-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -80, 0], // Réduit de -100 à -80
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2, // Augmenté de 3 à 4
              repeat: Infinity,
              delay: Math.random() * 3, // Augmenté de 2 à 3
              ease: "easeInOut"
            }}
            whileHover={{ scale: 1.5, rotate: 90 }} // Réduit de 2 à 1.5
          />
        ))}
      </div>

      {/* Canvas Three.js optimisé */}
      <div className="absolute inset-0 z-0">
        <Canvas 
          camera={{ position: [0, 0, 8], fov: 60 }}
          gl={{ 
            antialias: false, // Désactivé pour la performance
            powerPreference: "high-performance",
            alpha: false, // Désactive la transparence pour la performance
            stencil: false, // Désactive le stencil buffer
            depth: true, // Garde le depth buffer
            logarithmicDepthBuffer: false // Désactive pour la performance
          }}
          dpr={isTouchDeviceRef.current ? [1, 1.5] : [1, 2]} // Résolution réduite sur tactile
          performance={{ min: 0.5 }} // Performance minimale pour éviter les saccades
          frameloop="demand" // Optimise le rendu
        >
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 0, 0]} intensity={1.5} color="#fbbf24" />
          <EngagementParticles />
          <FloatingText />
          <KeyboardParticles />
          <OrbitControls 
            enableZoom={false} 
            autoRotate 
            autoRotateSpeed={0.05}
            enablePan={false} // Désactive le pan sur tactile
            enableDamping={true} // Active l'amortissement pour plus de fluidité
            dampingFactor={0.05} // Amortissement léger
          />
        </Canvas>
      </div>

      {/* Grille de fond optimisée */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-15"
        style={{ rotateX, rotateY }}
        transition={{ type: "spring", stiffness: 50, damping: 15 }}
      >
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(251, 191, 36, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(251, 191, 36, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px', // Augmenté de 50px à 60px
            animation: 'gridMove 30s linear infinite' // Augmenté de 20s à 30s
          }}
        />
      </motion.div>

      {/* Contenu principal avec effets créatifs optimisés */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header avec effet de glitch optimisé */}
        <header className="p-8 relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/15 to-transparent"
            animate={{
              x: [-100, 100],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          <motion.h1
            initial={{ y: -50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.2,
              type: "spring",
              stiffness: 80
            }}
            className="font-display text-5xl md:text-7xl font-bold text-center relative cursor-pointer"
            style={{
              background: 'linear-gradient(45deg, #fbbf24, #ec4899, #fbbf24)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradientShift 4s ease-in-out infinite'
            }}
            onHoverStart={() => setIsHovering(true)}
            onHoverEnd={() => setIsHovering(false)}
            onClick={() => {
              handleCardInteraction()
              // Effet de particules optimisé
              for (let i = 0; i < 10; i++) { // Réduit de 20 à 10
                const timer = setTimeout(() => {
                  const particle = document.createElement('div')
                  particle.className = 'absolute w-1 h-1 bg-amber-400 rounded-full pointer-events-none'
                  particle.style.left = `${Math.random() * 100}%`
                  particle.style.top = `${Math.random() * 100}%`
                  particle.style.animation = 'particleExplosion 0.8s ease-out forwards'
                  document.body.appendChild(particle)
                  
                  setTimeout(() => particle.remove(), 800)
                }, i * 80) // Augmenté de 50 à 80ms
                
                // Nettoyage automatique sans stockage
                setTimeout(() => clearTimeout(timer), 1000)
              }
            }}
          >
            L&apos;Engagement
          </motion.h1>

          {/* Effet de glitch optimisé */}
          <AnimatePresence>
            {isHovering && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.h1
                  className="font-display text-5xl md:text-7xl font-bold text-center absolute inset-0"
                  style={{
                    color: '#ec4899',
                    textShadow: '1px 0 #fbbf24, -1px 0 #fbbf24'
                  }}
                  animate={{
                    x: [0, -1, 1, 0],
                    y: [0, 0.5, -0.5, 0]
                  }}
                  transition={{
                    duration: 0.15,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  L&apos;Engagement
                </motion.h1>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-4 text-lg text-amber-200 font-light"
          >
            Le moment où nos âmes se sont unies pour l&apos;éternité...
          </motion.p>

          {/* Indicateur d'interaction optimisé */}
          <motion.div
            className="absolute top-4 right-8 text-amber-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Niveau d&apos;interaction: {interactionLevel}%
          </motion.div>
        </header>

        {/* Zone centrale avec carte interactive optimisée */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0, rotateY: 90 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ 
              duration: 1, 
              delay: 0.8,
              type: "spring",
              stiffness: 40
            }}
            className="relative group"
            style={{ rotateX, rotateY }}
            onHoverStart={handleCardInteraction}
          >
            {/* Carte principale avec effet de profondeur optimisé */}
            <motion.div
              className="bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-lg rounded-2xl p-6 max-w-3xl mx-auto border border-white/15 relative overflow-hidden cursor-pointer"
              whileHover={{ 
                scale: 1.01,
                rotateY: 3,
                rotateX: 1
              }}
              transition={{ duration: 0.2 }}
              style={{
                boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4)',
                transformStyle: 'preserve-3d'
              }}
              onClick={handleCardInteraction}
            >
              {/* Effet de brillance optimisé */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
                  transform: 'translateX(-100%)'
                }}
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 1.5
                }}
              />

              <h2 className="font-display text-3xl mb-6 text-amber-300 text-center relative z-10">
                Une Promesse Éternelle
              </h2>
              
              <p className="text-amber-100/80 leading-relaxed mb-6 text-base text-center relative z-10">
                Ce jour où nos âmes se sont unies, où nous avons promis 
                de marcher ensemble sur le chemin de la vie. 
                Nos cœurs battent désormais à l&apos;unisson, 
                créant une harmonie parfaite qui résonne dans l&apos;éternité...
              </p>

              {/* Message d'amour avec animation optimisée */}
              <motion.div
                className="bg-gradient-to-r from-amber-400/15 to-pink-400/15 rounded-xl p-4 mb-6 border border-amber-400/20 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/8 to-transparent"
                  animate={{
                    x: [-100, 100]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                <p className="font-display text-xl text-amber-200 italic text-center relative z-10">
                  &ldquo;Je te promets mon amour, ma fidélité et ma vie pour toujours.&rdquo;
                </p>
              </motion.div>

              {/* Anneaux interactifs optimisés */}
              <div className="flex justify-center space-x-6 mb-6">
                <motion.div
                  className="relative group/ring"
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: 8,
                    z: 50
                  }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    handleCardInteraction()
                    // Effet de particules optimisé
                    for (let i = 0; i < 8; i++) { // Réduit de 15 à 8
                      const timer = setTimeout(() => {
                        const particle = document.createElement('div')
                        particle.className = 'absolute w-1.5 h-1.5 rounded-full pointer-events-none'
                        particle.style.backgroundColor = ['#fbbf24', '#ec4899', '#f59e0b'][Math.floor(Math.random() * 3)]
                        particle.style.left = '50%'
                        particle.style.top = '50%'
                        particle.style.transform = 'translate(-50%, -50%)'
                        particle.style.animation = `ringExplosion 0.8s ease-out forwards`
                        document.body.appendChild(particle)
                        
                        setTimeout(() => particle.remove(), 800)
                      }, i * 50) // Augmenté de 30 à 50ms
                      
                      // Nettoyage automatique sans stockage
                      setTimeout(() => clearTimeout(timer), 1000)
                    }
                  }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg shadow-amber-400/20 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: [-100, 100]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    <span className="text-2xl relative z-10">💍</span>
                  </div>
                  
                  {/* Aura autour de l'anneau optimisée */}
                  <motion.div
                    className="absolute inset-0 rounded-full border border-amber-400/30"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0, 0.3]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>

                <motion.div
                  className="relative group/ring"
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: -8,
                    z: 50
                  }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    handleCardInteraction()
                    // Effet de vague optimisé
                    const wave = document.createElement('div')
                    wave.className = 'absolute inset-0 rounded-full border border-pink-400 pointer-events-none'
                    wave.style.animation = 'waveExpand 0.8s ease-out forwards'
                    document.body.appendChild(wave)
                    
                    // Nettoyage automatique sans stockage
                    setTimeout(() => wave.remove(), 800)
                  }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg shadow-pink-400/20 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: [-100, 100]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 1.5
                      }}
                    />
                    <span className="text-2xl relative z-10">💎</span>
                  </div>
                  
                  {/* Aura autour de l'anneau optimisée */}
                  <motion.div
                    className="absolute inset-0 rounded-full border border-pink-400/30"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0, 0.3]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.5
                    }}
                  />
                </motion.div>
              </div>

              {/* Barre de progression d'amour optimisée */}
              <motion.div
                className="w-full bg-amber-900/20 rounded-full h-2 mb-4 overflow-hidden border border-amber-400/20"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 2 }}
              >
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-400 via-pink-400 to-amber-400 rounded-full relative"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: [-100, 300] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </motion.div>

              {/* Easter Egg optimisé */}
              <motion.button
                className="absolute bottom-3 right-3 opacity-15 hover:opacity-100 transition-all duration-500 text-xl cursor-pointer"
                onClick={() => {
                  triggerEasterEgg(3)
                  handleCardInteraction()
                  // Effet de transformation optimisé
                  document.body.style.filter = 'hue-rotate(90deg)'
                  // Nettoyage automatique sans stockage
                  setTimeout(() => {
                    document.body.style.filter = 'none'
                  }, 800)
                }}
                whileHover={{ 
                  scale: 1.3, 
                  rotate: 360,
                  filter: 'hue-rotate(90deg)'
                }}
                transition={{ duration: 0.6 }}
              >
                🌟
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Navigation optimisée */}
        <nav className="p-6 flex justify-between items-center relative">
          {/* Particules de navigation optimisées */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: particleCount }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-0.5 bg-amber-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.8 }}
                whileHover={{ scale: 2, opacity: 0.6 }}
              />
            ))}
          </div>

          <Link href="/chapter2">
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-amber-400/15 to-amber-600/15 text-amber-200 rounded-full font-medium border border-amber-400/20 backdrop-blur-sm relative overflow-hidden group"
              whileHover={{ 
                scale: 1.03,
                boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)'
              }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCardInteraction}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/15 to-transparent"
                animate={{
                  x: [-100, 100]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <span className="relative z-10">← Précédent</span>
            </motion.button>
          </Link>
          
          {/* Indicateurs de chapitre optimisés */}
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((chapter) => (
              <motion.div
                key={chapter}
                className={`w-3 h-3 rounded-full cursor-pointer ${
                  chapter === 3 
                    ? 'bg-gradient-to-r from-amber-400 to-pink-400' 
                    : 'bg-white/15 border border-white/20'
                }`}
                animate={chapter === 3 ? {
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 8px rgba(251, 191, 36, 0.4)',
                    '0 0 15px rgba(251, 191, 36, 0.6)',
                    '0 0 8px rgba(251, 191, 36, 0.4)'
                  ]
                } : {}}
                transition={{ duration: 3, repeat: Infinity }}
                whileHover={{ scale: 1.3 }}
                onClick={() => handleCardInteraction()}
              />
            ))}
          </div>
          
          <Link href="/chapter4">
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-pink-400/15 to-pink-600/15 text-pink-200 rounded-full font-medium border border-pink-400/20 backdrop-blur-sm relative overflow-hidden group"
              whileHover={{ 
                scale: 1.03,
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)'
              }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCardInteraction}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/15 to-transparent"
                animate={{
                  x: [-100, 100]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 1.5
                }}
              />
              <span className="relative z-10">Suivant →</span>
            </motion.button>
          </Link>
        </nav>
      </div>

      {/* Message d'amour flottant optimisé */}
      <AnimatePresence>
        {showLoveMessage && (
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="text-5xl"
              animate={{
                y: [0, -15, 0],
                rotate: [0, 3, -3, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              💕
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message secret au clavier optimisé */}
      <AnimatePresence>
        {showSecretMessage && (
          <motion.div
            className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-5 py-2 rounded-full text-base font-bold shadow-lg">
              💖 Message Secret: Appuie sur T pour écrire un message d&apos;amour !
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message dactylographié avec input personnalisé optimisé */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-gradient-to-br from-amber-500 to-pink-600 rounded-2xl p-6 max-w-sm mx-4 text-center shadow-xl border border-white/15"
              initial={{ scale: 0, rotateY: 90 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0, rotateY: -90 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">
                💕 Écris ton message d&apos;amour
              </h3>
              
              {isInputVisible ? (
                <div className="space-y-3">
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tape ton message d'amour ici..."
                    className="w-full h-24 p-3 rounded-lg border border-white/20 bg-white/8 text-white placeholder-white/60 resize-none focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/30"
                    autoFocus
                    style={{ fontFamily: 'inherit' }}
                    maxLength={500}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                  />
                  
                  <div className="text-white/60 text-xs">
                    {userInput.length}/500 caractères
                  </div>
                  
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={handleMessageSubmit}
                      disabled={!userInput.trim()}
                      className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all duration-200 ${
                        userInput.trim() 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700' 
                          : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                      }`}
                      whileHover={userInput.trim() ? { scale: 1.02 } : {}}
                      whileTap={userInput.trim() ? { scale: 0.98 } : {}}
                    >
                      Envoyer 💌
                    </motion.button>
                    
                    <motion.button
                      onClick={handleCloseInterface}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Annuler ❌
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white/15 rounded-lg p-3 min-h-[3rem] flex items-center justify-center">
                    <p className="text-white text-base font-medium break-words text-center leading-relaxed">
                      {typedText || "Ton message apparaîtra ici..."}
                      {typedText && <span className="animate-pulse ml-1">|</span>}
                    </p>
                  </div>
                  
                  {typedText && (
                    <motion.div
                      className="text-pink-200 text-xs text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      ✨ Message d&apos;amour envoyé avec succès !
                    </motion.div>
                  )}
                  
                  <motion.div
                    className="text-pink-200 text-xs text-center"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    🎵 Musique d&apos;amour en cours...
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicateur de musique optimisé */}
      {isMusicPlaying && (
        <motion.div
          className="fixed top-3 left-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md z-40"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 90 }}
        >
          🎵 Musique d&apos;amour
        </motion.div>
      )}

      {/* Instructions d'interaction optimisées */}
      <motion.div
        className="fixed bottom-3 left-3 text-amber-400/60 text-xs pointer-events-none max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        <p className="mb-1">💡 Interactions:</p>
        <p className="mb-1">• Cliquez partout pour des effets</p>
        <p className="mb-1">• Appuyez sur L pour le message secret</p>
        <p className="mb-1">• Appuyez sur T ou double-tapez pour écrire</p>
        <p>• Sur iPad Pro: double-tapez l&apos;écran</p>
      </motion.div>

      {/* Styles CSS personnalisés optimisés */}
      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes particleExplosion {
          0% { 
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% { 
            transform: translate(-50%, -50%) scale(2.5);
            opacity: 0;
          }
        }

        @keyframes ringExplosion {
          0% { 
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 1;
          }
          100% { 
            transform: translate(-50%, -50%) scale(3) rotate(180deg);
            opacity: 0;
          }
        }

        @keyframes waveExpand {
          0% { 
            transform: scale(0);
            opacity: 1;
          }
          100% { 
            transform: scale(8);
            opacity: 0;
          }
        }
      `}</style>
    </motion.div>
  )
}
