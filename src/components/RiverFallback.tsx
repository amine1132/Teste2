'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface RiverFallbackProps {
  onInteractionProgress?: (progress: number) => void
  targetInteractions?: number
  intensity?: number
}

interface WavePoint {
  x: number
  y: number
  amplitude: number
  frequency: number
  phase: number
}

export default function RiverFallback({ 
  onInteractionProgress, 
  targetInteractions = 100,
  intensity = 1
}: RiverFallbackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0, isPressed: false })
  const interactionCountRef = useRef(0)
  const lastInteractionTime = useRef(0)
  const wavePoints = useRef<WavePoint[]>([])
  
  const [currentInteractions, setCurrentInteractions] = useState(0)
  const [isInteracting, setIsInteracting] = useState(false)

  // Initialiser les points de vague
  const initializeWaves = useCallback(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    wavePoints.current = []
    
    for (let i = 0; i < 8; i++) {
      wavePoints.current.push({
        x: 0,
        y: canvas.height * (0.3 + i * 0.05),
        amplitude: 20 + Math.random() * 15,
        frequency: 0.01 + Math.random() * 0.005,
        phase: Math.random() * Math.PI * 2
      })
    }
  }, [])

  // Rendu CSS/Canvas optimisé
  const render = useCallback(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Gradient de fond
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.05)')
    gradient.addColorStop(0.3, 'rgba(59, 130, 246, 0.3)')
    gradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.3)')
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Dessiner les vagues
    wavePoints.current.forEach((wave, index) => {
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.4 - index * 0.04})`
      ctx.lineWidth = 3 - index * 0.2
      ctx.beginPath()
      
      for (let x = 0; x <= canvas.width; x += 2) {
        const baseY = wave.y
        let waveY = baseY + Math.sin(x * wave.frequency + timeRef.current + wave.phase) * wave.amplitude
        
        // Interaction avec la souris
        if (mouseRef.current.isPressed) {
          const dist = Math.sqrt(Math.pow(x - mouseRef.current.x, 2) + Math.pow(waveY - mouseRef.current.y, 2))
          const influence = Math.max(0, 100 - dist) / 100
          const ripple = Math.sin(dist * 0.1 - timeRef.current * 3) * influence * 20 * intensity
          waveY += ripple
        }
        
        if (x === 0) {
          ctx.moveTo(x, waveY)
        } else {
          ctx.lineTo(x, waveY)
        }
      }
      
      ctx.stroke()
    })
    
    // Effet de brillance
    if (mouseRef.current.isPressed) {
      const mouseGradient = ctx.createRadialGradient(
        mouseRef.current.x, mouseRef.current.y, 0,
        mouseRef.current.x, mouseRef.current.y, 150
      )
      mouseGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)')
      mouseGradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
      
      ctx.fillStyle = mouseGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    
    timeRef.current += 0.02
  }, [intensity])

  // Animation
  const animate = useCallback(() => {
    render()
    animationRef.current = requestAnimationFrame(animate)
  }, [render])

  // Gestion des interactions
  const handleInteraction = useCallback((x: number, y: number) => {
    const now = Date.now()
    if (now - lastInteractionTime.current < 100) return // Throttling plus large pour les performances
    
    lastInteractionTime.current = now
    interactionCountRef.current++
    setCurrentInteractions(interactionCountRef.current)
    onInteractionProgress?.(Math.min(interactionCountRef.current / targetInteractions, 1))
  }, [targetInteractions, onInteractionProgress])

  // Événements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
      
      if (mouseRef.current.isPressed) {
        handleInteraction(mouseRef.current.x, mouseRef.current.y)
      }
    }
    
    const handleMouseDown = () => {
      mouseRef.current.isPressed = true
      setIsInteracting(true)
    }
    
    const handleMouseUp = () => {
      mouseRef.current.isPressed = false
      setIsInteracting(false)
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!canvasRef.current) return
      e.preventDefault()
      const rect = canvasRef.current.getBoundingClientRect()
      const touch = e.touches[0]
      mouseRef.current.x = touch.clientX - rect.left
      mouseRef.current.y = touch.clientY - rect.top
      
      if (mouseRef.current.isPressed) {
        handleInteraction(mouseRef.current.x, mouseRef.current.y)
      }
    }
    
    const handleTouchStart = () => {
      mouseRef.current.isPressed = true
      setIsInteracting(true)
    }
    
    const handleTouchEnd = () => {
      mouseRef.current.isPressed = false
      setIsInteracting(false)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleInteraction])

  // Setup
  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    
    resizeCanvas()
    initializeWaves()
    
    window.addEventListener('resize', resizeCanvas)
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [initializeWaves, animate])

  const progress = Math.min(currentInteractions / targetInteractions, 1)

  return (
    <div className="relative w-full h-full">
      {/* Canvas fallback */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Couches CSS additionnelles pour plus de réalisme */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400/10 via-blue-500/20 to-blue-600/10 pointer-events-none" />
      
      {/* Particules flottantes CSS */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-300/40 rounded-full"
          style={{
            left: `${10 + (i * 15)}%`,
            top: `${40 + Math.sin(i) * 20}%`
          }}
          animate={{
            x: [0, 20, 0],
            y: [0, -10, 0],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5
          }}
        />
      ))}
      
      {/* Instructions */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: progress < 0.8 ? 1 : 0, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-blue-400/30">
          <p className="text-white font-medium text-lg mb-2">
            🌊 Maintiens enfoncé pour faire onduler la rivière
          </p>
          <p className="text-blue-200 text-sm">
            Version optimisée pour votre appareil
          </p>
        </div>
      </motion.div>
      
      {/* Barre de progression */}
      <motion.div
        className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-black/30 backdrop-blur-sm rounded-full p-3 min-w-[320px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm">
              Rivière des émotions ({currentInteractions}/{targetInteractions})
            </span>
            <span className="text-white text-sm font-bold">
              {Math.round(progress * 100)}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 relative overflow-hidden">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent h-full"
                animate={{ x: [-100, 300] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
