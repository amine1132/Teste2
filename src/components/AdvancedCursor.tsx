'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface CursorTrail {
  x: number
  y: number
  timestamp: number
  pressure: number
  id: string
}

interface AdvancedCursorProps {
  mode?: 'carve' | 'conduct' | 'wield' | 'sculpt'
  intensity?: number
  onInteraction?: (x: number, y: number, pressure: number) => void
}

export default function AdvancedCursor({ 
  mode = 'carve', 
  intensity = 1, // Sera utilisé plus tard pour les effets
  onInteraction 
}: AdvancedCursorProps) {
  const [trails, setTrails] = useState<CursorTrail[]>([])
  const [isPressed, setIsPressed] = useState(false)
  const [currentPressure, setCurrentPressure] = useState(0)
  
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const springX = useSpring(cursorX, { stiffness: 500, damping: 28 })
  const springY = useSpring(cursorY, { stiffness: 500, damping: 28 })
  
  const pressStartTime = useRef<number>(0)
  const animationRef = useRef<number>(0)

  const addTrailPoint = useCallback((x: number, y: number, pressure: number) => {
    const id = `${Date.now()}-${Math.random()}`
    const newPoint: CursorTrail = { x, y, timestamp: Date.now(), pressure, id }
    
    setTrails(prev => {
      const updated = [...prev, newPoint].slice(-20) // Garder 20 points max
      return updated
    })

    onInteraction?.(x, y, pressure)
  }, [onInteraction])

  const updatePressure = useCallback(() => {
    if (isPressed) {
      const elapsed = Date.now() - pressStartTime.current
      const pressure = Math.min(elapsed / 500, 1) // Montée progressive sur 500ms
      setCurrentPressure(pressure)
      animationRef.current = requestAnimationFrame(updatePressure)
    }
  }, [isPressed])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      
      if (isPressed) {
        addTrailPoint(e.clientX, e.clientY, currentPressure)
        console.log('Drawing:', e.clientX, e.clientY, currentPressure) // Debug temporaire
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      setIsPressed(true)
      pressStartTime.current = Date.now()
      addTrailPoint(e.clientX, e.clientY, 0.3) // Pression initiale plus élevée pour PC
      updatePressure()
      console.log('Mouse down detected:', e.clientX, e.clientY) // Debug
    }

    const handleMouseUp = () => {
      setIsPressed(false)
      setCurrentPressure(0)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      // Signaler la fin du trait pour permettre un nouveau trait
      onInteraction?.(-1, -1, -1) // Signal spécial pour la fin du trait
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        setIsPressed(true)
        pressStartTime.current = Date.now()
        cursorX.set(touch.clientX)
        cursorY.set(touch.clientY)
        addTrailPoint(touch.clientX, touch.clientY, 0.1)
        updatePressure()
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        cursorX.set(touch.clientX)
        cursorY.set(touch.clientY)
        
        if (isPressed) {
          addTrailPoint(touch.clientX, touch.clientY, currentPressure)
        }
      }
    }

    const handleTouchEnd = () => {
      setIsPressed(false)
      setCurrentPressure(0)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      // Signaler la fin du trait pour tactile aussi
      onInteraction?.(-1, -1, -1) // Signal spécial pour la fin du trait
    }

    // Nettoyage des anciens trails
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      setTrails(prev => prev.filter(trail => now - trail.timestamp < 2000))
    }, 100)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      clearInterval(cleanupInterval)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [cursorX, cursorY, isPressed, currentPressure, addTrailPoint, updatePressure, onInteraction])

  const getCursorStyle = () => {
    switch (mode) {
      case 'carve':
        return {
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.6) 50%, transparent 100%)',
          border: '2px solid rgba(59, 130, 246, 0.4)'
        }
      case 'conduct':
        return {
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.8) 0%, rgba(168, 85, 247, 0.6) 50%, transparent 100%)',
          border: '2px solid rgba(236, 72, 153, 0.4)'
        }
      case 'wield':
        return {
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.8) 0%, rgba(59, 130, 246, 0.6) 50%, transparent 100%)',
          border: '2px solid rgba(34, 197, 94, 0.4)'
        }
      case 'sculpt':
        return {
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.8) 0%, rgba(245, 158, 11, 0.6) 50%, transparent 100%)',
          border: '2px solid rgba(251, 191, 36, 0.4)'
        }
    }
  }

  const getTrailColor = (pressure: number) => {
    const alpha = Math.max(0.1, pressure)
    switch (mode) {
      case 'carve':
        return `rgba(59, 130, 246, ${alpha})`
      case 'conduct':
        return `rgba(236, 72, 153, ${alpha})`
      case 'wield':
        return `rgba(34, 197, 94, ${alpha})`
      case 'sculpt':
        return `rgba(251, 191, 36, ${alpha})`
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Curseur principal */}
      <motion.div
        className="fixed w-8 h-8 rounded-full mix-blend-screen"
        style={{
          left: springX,
          top: springY,
          x: -16,
          y: -16,
          scale: isPressed ? 1.5 + currentPressure : 1,
          ...getCursorStyle()
        }}
        initial={{ scale: 0 }}
        animate={{ scale: isPressed ? 1.5 + currentPressure : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Effet de pulsation pour le mode actif */}
        {isPressed && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: getCursorStyle().background,
              filter: 'blur(4px)'
            }}
            animate={{ 
              scale: [1, 2, 1],
              opacity: [0.8, 0.2, 0.8]
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>

      {/* Trails de curseur */}
      {trails.map((trail) => {
        const age = Date.now() - trail.timestamp
        const opacity = Math.max(0, 1 - age / 2000)
        const scale = 0.3 + trail.pressure * 0.7
        
        return (
          <motion.div
            key={trail.id}
            className="fixed rounded-full mix-blend-screen"
            style={{
              left: trail.x,
              top: trail.y,
              x: -4,
              y: -4,
              width: 8 + trail.pressure * 12,
              height: 8 + trail.pressure * 12,
              background: getTrailColor(trail.pressure),
              opacity: opacity * trail.pressure,
              filter: `blur(${trail.pressure * 2}px)`
            }}
            initial={{ scale: 0 }}
            animate={{ scale: scale }}
            exit={{ scale: 0, opacity: 0 }}
          />
        )
      })}

      {/* Effet de vague lors du press and hold */}
      {isPressed && (
        <motion.div
          className="fixed rounded-full border-2 mix-blend-screen"
          style={{
            left: springX,
            top: springY,
            x: -50,
            y: -50,
            width: 100,
            height: 100,
            borderColor: getTrailColor(0.6),
            background: 'transparent'
          }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.8, 0, 0.8]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      )}

      {/* Instructions dynamiques */}
      <motion.div
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <p className="text-white/80 text-sm font-medium bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
          {mode === 'carve' && 'Maintiens enfoncé pour sculpter ton chemin'}
          {mode === 'conduct' && 'Dirige la mélodie avec ton curseur'}
          {mode === 'wield' && 'Contrôle les forces avec ton geste'}
          {mode === 'sculpt' && 'Façonne la matière à ta guise'}
        </p>
      </motion.div>
    </div>
  )
}

