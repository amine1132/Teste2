'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// import AdvancedCursor from './AdvancedCursor' // Temporairement désactivé pour debug
import SimpleCursorDebug from './SimpleCursorDebug'
import { triggerEasterEgg } from '@/utils/easterEggs'
// import CinematicParticles from './CinematicParticles' // Temporairement désactivé pour debug

interface InteractionArea {
  x: number
  y: number
  radius: number
  intensity: number
  timestamp: number
  id: string
}

interface InteractiveChapterProps {
  children: React.ReactNode
  chapterNumber: number
  title: string
  subtitle: string
  instruction: string
  theme: 'love' | 'glacier' | 'river' | 'ocean' | 'earth'
  onInteractionComplete?: () => void
}

export default function InteractiveChapter({
  children,
  chapterNumber,
  title,
  subtitle,
  instruction,
  theme,
  onInteractionComplete
}: InteractiveChapterProps) {
  const [interactionAreas, setInteractionAreas] = useState<InteractionArea[]>([])
  const [showInstruction, setShowInstruction] = useState(true)
  const [interactionCount, setInteractionCount] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isInteracting, setIsInteracting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false) // Nouvel état pour éviter les notifications infinies
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const lastInteractionTime = useRef<number>(0) // Pour ralentir le comptage
  const lastDrawPosition = useRef<{ x: number, y: number } | null>(null) // Pour dessiner des lignes continues

  // Configuration des modes par chapitre
  const getChapterConfig = () => {
    switch (chapterNumber) {
      case 1:
        return {
          mode: 'carve' as const,
          requiredInteractions: 150, // Augmenté de 25 à 50 pour dessiner plus longtemps
          effectColor: 'rgba(236, 72, 153, 0.6)', // Plus opaque pour être plus visible
          strokeColor: 'rgba(255, 105, 180, 0.9)', // Couleur de trait spécifique
          title: 'Premier Regard',
          subtitle: 'L\'étincelle qui a tout changé'
        }
      case 2:
        return {
          mode: 'conduct' as const,
          requiredInteractions: 60, // Augmenté de 30 à 60
          effectColor: 'rgba(59, 130, 246, 0.6)',
          strokeColor: 'rgba(96, 165, 250, 0.9)',
          title: 'Premiers Mots',
          subtitle: 'Quand nos âmes se sont parlé'
        }
      case 3:
        return {
          mode: 'wield' as const,
          requiredInteractions: 70, // Augmenté de 35 à 70
          effectColor: 'rgba(34, 197, 94, 0.6)',
          strokeColor: 'rgba(74, 222, 128, 0.9)',
          title: 'L\'Engagement',
          subtitle: 'Notre promesse éternelle'
        }
      case 4:
        return {
          mode: 'sculpt' as const,
          requiredInteractions: 80, // Augmenté de 40 à 80
          effectColor: 'rgba(251, 191, 36, 0.6)',
          strokeColor: 'rgba(252, 211, 77, 0.9)',
          title: 'Notre Éternité',
          subtitle: 'L\'amour qui grandit chaque jour'
        }
      default:
        return {
          mode: 'carve' as const,
          requiredInteractions: 25,
          effectColor: 'rgba(236, 72, 153, 0.6)',
          strokeColor: 'rgba(255, 105, 180, 0.9)',
          title: title,
          subtitle: subtitle
        }
    }
  }

  const config = getChapterConfig()

  // Gestionnaire d'interaction
  const handleInteraction = useCallback((x: number, y: number, pressure: number) => {
    // Signal spécial pour la fin du trait
    if (x === -1 && y === -1 && pressure === -1) {
      lastDrawPosition.current = null
      setIsInteracting(false)
      return
    }

    if (pressure < 0.1) {
      return
    }

    setIsInteracting(true)

    // TOUJOURS dessiner sur le canvas (pas de throttling pour le dessin)
    console.log('Dessin sur canvas:', x, y, pressure) // Debug temporaire
    if (contextRef.current) {
      const ctx = contextRef.current
      ctx.globalCompositeOperation = 'source-over'
      
      // Configuration du style de trait
      ctx.strokeStyle = config.strokeColor || config.effectColor.replace('0.6', '0.9')
      ctx.fillStyle = config.effectColor
      ctx.lineWidth = 12 + pressure * 8
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalAlpha = 0.8
      
      if (lastDrawPosition.current) {
        // Dessiner une ligne depuis la dernière position
        ctx.beginPath()
        ctx.moveTo(lastDrawPosition.current.x, lastDrawPosition.current.y)
        ctx.lineTo(x, y)
        ctx.stroke()
        
        // Ajouter un cercle pour renforcer le trait
        ctx.beginPath()
        ctx.arc(x, y, (12 + pressure * 8) / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Premier point - juste un cercle
        ctx.beginPath()
        ctx.arc(x, y, (12 + pressure * 8) / 2, 0, Math.PI * 2)
        ctx.fill()
      }
      
      lastDrawPosition.current = { x, y }
    }

    // Throttling SEULEMENT pour le comptage des interactions (réduit à 50ms)
    const now = Date.now()
    if (now - lastInteractionTime.current < 50) {
      return // Sort tôt mais après avoir dessiné
    }
    lastInteractionTime.current = now

    // Compter l'interaction
    const id = `${Date.now()}-${Math.random()}`
    const newArea: InteractionArea = {
      x,
      y,
      radius: 20 + pressure * 40,
      intensity: pressure,
      timestamp: Date.now(),
      id
    }

    setInteractionAreas(prev => [...prev, newArea])
    setInteractionCount(prev => prev + 1)

    // Vérifier si l'interaction est complète (une seule fois)
    if (interactionCount >= config.requiredInteractions - 1 && !isCompleted) {
      setIsCompleted(true)
      
      // Déclencher l'easter egg
      triggerEasterEgg(chapterNumber)
      
      setTimeout(() => {
        onInteractionComplete?.()
      }, 1000)
    }

    // Nettoyer après un délai
    setTimeout(() => {
      setInteractionAreas(prev => prev.filter(area => area.id !== id))
    }, 3000)
  }, [interactionCount, config.requiredInteractions, config.effectColor, config.strokeColor, onInteractionComplete, isCompleted])

  // Gestionnaire de mouvement de souris
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }, [])

  // Ajout des événements de souris
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleMouseMove])

  // Setup du canvas
  const setupCanvas = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        contextRef.current = ctx
      }
    }
  }, [])

  // Progression de l'interaction
  const progress = Math.min(interactionCount / config.requiredInteractions, 1)

  return (
    <motion.div
      className="relative w-full h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      onAnimationComplete={setupCanvas}
    >
      {/* Particules cinématiques - temporairement désactivées */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />
      {/* <CinematicParticles 
        theme={theme} 
        interactive={true}
        mousePosition={mousePosition}
      /> */}

      {/* Canvas pour les effets d'interaction */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Curseur simplifié pour debug */}
      <SimpleCursorDebug 
        mode={config.mode}
        intensity={1 + progress}
        onInteraction={handleInteraction}
      />

      {/* Header animé */}
      <motion.header 
        className="absolute top-0 left-0 right-0 z-20 p-8"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="text-center">
          <motion.h1 
            className="font-display text-6xl md:text-7xl font-bold text-white text-glow"
            animate={{ 
              textShadow: isInteracting 
                ? '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(236,72,153,0.6)' 
                : '0 0 10px rgba(255,255,255,0.4)'
            }}
          >
            {config.title}
          </motion.h1>
          <motion.p 
            className="text-xl text-white/80 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {config.subtitle}
          </motion.p>
        </div>
      </motion.header>

      {/* Zone de contenu principal */}
      <div className="relative z-15 h-full flex flex-col justify-center">
        {children}
      </div>

      {/* Barre de progression */}
      <motion.div 
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className="bg-black/30 backdrop-blur-sm rounded-full p-4 min-w-[320px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm">
              Dessine ton histoire ({interactionCount}/{config.requiredInteractions})
            </span>
            <span className="text-white text-sm font-bold">
              {Math.round(progress * 100)}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 relative overflow-hidden">
            <motion.div 
              className="h-3 rounded-full bg-gradient-to-r from-romantic-pink to-romantic-purple relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5 }}
            >
              {/* Effet de brillance */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent h-full"
                animate={{ x: [-100, 200] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
          {progress < 1 && (
            <p className="text-white/60 text-xs mt-2 text-center">
              Continue de dessiner pour débloquer la suite...
            </p>
          )}
        </div>
      </motion.div>

      {/* Instructions d'interaction */}
      <AnimatePresence>
        {showInstruction && progress < 0.2 && (
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 2 }}
          >
            <motion.div 
              className="bg-black/40 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-white/20"
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 20px rgba(236,72,153,0.2)',
                  '0 0 30px rgba(236,72,153,0.4)',
                  '0 0 20px rgba(236,72,153,0.2)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <p className="text-white font-medium">{instruction}</p>
              <p className="text-white/60 text-sm mt-1">
                Maintiens enfoncé et dessine ton histoire
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Effets visuels des zones d'interaction */}
      {interactionAreas.map(area => {
        const age = Date.now() - area.timestamp
        const opacity = Math.max(0, 1 - age / 3000)
        
        return (
          <motion.div
            key={area.id}
            className="absolute rounded-full pointer-events-none z-25 mix-blend-screen"
            style={{
              left: area.x - area.radius,
              top: area.y - area.radius,
              width: area.radius * 2,
              height: area.radius * 2,
              background: `radial-gradient(circle, ${config.effectColor} 0%, transparent 70%)`,
              opacity: opacity * area.intensity
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          />
        )
      })}


    </motion.div>
  )
}
