'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface SimpleCursorProps {
  onInteraction?: (x: number, y: number, pressure: number) => void
}

export default function SimpleCursor({ onInteraction }: SimpleCursorProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [trails, setTrails] = useState<Array<{ x: number, y: number, id: string, timestamp: number }>>([])

  const addTrail = useCallback((x: number, y: number) => {
    const id = `${Date.now()}-${Math.random()}`
    setTrails(prev => [...prev, { x, y, id, timestamp: Date.now() }].slice(-15))
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      
      if (isPressed) {
        addTrail(e.clientX, e.clientY)
        onInteraction?.(e.clientX, e.clientY, 0.7) // Pression fixe pour simplicité
        console.log('Simple cursor interaction:', e.clientX, e.clientY)
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      setIsPressed(true)
      addTrail(e.clientX, e.clientY)
      onInteraction?.(e.clientX, e.clientY, 0.5)
      console.log('Simple cursor down:', e.clientX, e.clientY)
    }

    const handleMouseUp = () => {
      setIsPressed(false)
      console.log('Simple cursor up')
    }

    // Nettoyage des trails
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      setTrails(prev => prev.filter(trail => now - trail.timestamp < 1000))
    }, 100)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      clearInterval(cleanupInterval)
    }
  }, [isPressed, onInteraction, addTrail])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Curseur principal */}
      <motion.div
        className="fixed w-6 h-6 rounded-full border-2 border-pink-400 bg-pink-400/30"
        style={{
          left: position.x - 12,
          top: position.y - 12,
        }}
        animate={{
          scale: isPressed ? 1.5 : 1,
          borderColor: isPressed ? '#ec4899' : '#f472b6'
        }}
      />

      {/* Trails simples */}
      {trails.map(trail => {
        const age = Date.now() - trail.timestamp
        const opacity = Math.max(0, 1 - age / 1000)
        
        return (
          <motion.div
            key={trail.id}
            className="fixed w-3 h-3 rounded-full bg-pink-400"
            style={{
              left: trail.x - 6,
              top: trail.y - 6,
              opacity: opacity * 0.6
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          />
        )
      })}

      {/* Instructions */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg">
        <p className="text-sm">
          {isPressed ? 'Continue de dessiner...' : 'Clique et maintiens enfoncé pour dessiner'}
        </p>
      </div>
    </div>
  )
}

