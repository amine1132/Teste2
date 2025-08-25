'use client'

import { useEffect, useState } from 'react'

interface SimpleCursorDebugProps {
  mode?: string
  intensity?: number
  onInteraction?: (x: number, y: number, pressure: number) => void
}

export default function SimpleCursorDebug({ onInteraction }: SimpleCursorDebugProps) {
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDrawing) {
        onInteraction?.(e.clientX, e.clientY, 0.7)
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      setIsDrawing(true)
      onInteraction?.(e.clientX, e.clientY, 0.5)
    }

    const handleMouseUp = () => {
      setIsDrawing(false)
      onInteraction?.(-1, -1, -1) // Signal de fin
    }

    // Gestion des événements tactiles pour iPad Pro
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      const target = e.target as HTMLElement
      
      // Si on touche un bouton ou un lien, on ne dessine pas
      if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
        return
      }
      
      e.preventDefault()
      setIsDrawing(true)
      onInteraction?.(touch.clientX, touch.clientY, 0.8)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isDrawing) {
        e.preventDefault()
        const touch = e.touches[0]
        onInteraction?.(touch.clientX, touch.clientY, 0.7)
      }
    }

    const handleTouchEnd = () => {
      setIsDrawing(false)
      onInteraction?.(-1, -1, -1) // Signal de fin
    }

    // Événements souris
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    // Événements tactiles
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDrawing, onInteraction])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-white/80 text-sm font-medium bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
          Mode Debug - {isDrawing ? 'Dessin en cours...' : 'Touche l\'écran pour dessiner, touche les boutons pour naviguer'}
        </p>
      </div>
    </div>
  )
}
