'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface TrailPoint {
  x: number
  y: number
  timestamp: number
}

export default function CursorTrail() {
  const [trails, setTrails] = useState<TrailPoint[]>([])
  const [isMoving, setIsMoving] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPoint: TrailPoint = {
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      }

      setTrails(prev => {
        const updated = [...prev, newPoint]
        // Garder seulement les 10 derniers points
        return updated.slice(-10)
      })

      setIsMoving(true)
      
      // Réinitialiser le timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsMoving(false)
      }, 150)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        const newPoint: TrailPoint = {
          x: touch.clientX,
          y: touch.clientY,
          timestamp: Date.now()
        }

        setTrails(prev => {
          const updated = [...prev, newPoint]
          return updated.slice(-10)
        })

        setIsMoving(true)
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        timeoutRef.current = setTimeout(() => {
          setIsMoving(false)
        }, 150)
      }
    }

    // Nettoyage périodique des anciens points
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      setTrails(prev => prev.filter(point => now - point.timestamp < 1000))
    }, 100)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      clearInterval(cleanupInterval)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {trails.map((point, index) => {
        const age = Date.now() - point.timestamp
        const opacity = Math.max(0, 1 - age / 1000)
        const scale = Math.max(0.1, 1 - age / 1000)
        
        return (
          <motion.div
            key={`${point.timestamp}-${index}`}
            className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-romantic-pink to-romantic-purple"
            style={{
              left: point.x - 6,
              top: point.y - 6,
              opacity: opacity * 0.6,
              transform: `scale(${scale})`
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: scale, opacity: opacity * 0.6 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )
      })}
      
      {/* Effet de halo autour du curseur */}
      {isMoving && trails.length > 0 && (
        <motion.div
          className="absolute w-8 h-8 rounded-full border-2 border-romantic-pink/40"
          style={{
            left: trails[trails.length - 1]?.x - 16,
            top: trails[trails.length - 1]?.y - 16,
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  )
}

