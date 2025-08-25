'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface CinematicBackgroundProps {
  theme?: 'river' | 'ocean' | 'waterfall' | 'romantic'
  intensity?: number
  mousePosition?: { x: number, y: number }
}

export default function CinematicBackground({ 
  theme = 'river', 
  intensity = 1,
  mousePosition = { x: 0, y: 0 }
}: CinematicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)

  const getThemeConfig = () => {
    switch (theme) {
      case 'river':
        return {
          colors: [
            'rgba(59, 130, 246, 0.1)',   // Bleu clair
            'rgba(96, 165, 250, 0.08)',  // Bleu moyen
            'rgba(147, 197, 253, 0.06)', // Bleu pâle
            'rgba(191, 219, 254, 0.04)'  // Bleu très pâle
          ],
          flowSpeed: 0.5,
          waveHeight: 30,
          layers: 4
        }
      case 'ocean':
        return {
          colors: [
            'rgba(34, 197, 94, 0.1)',   // Vert émeraude
            'rgba(74, 222, 128, 0.08)', // Vert clair
            'rgba(134, 239, 172, 0.06)', // Vert pâle
            'rgba(187, 247, 208, 0.04)'  // Vert très pâle
          ],
          flowSpeed: 0.3,
          waveHeight: 40,
          layers: 5
        }
      case 'waterfall':
        return {
          colors: [
            'rgba(168, 85, 247, 0.1)',  // Violet
            'rgba(196, 181, 253, 0.08)', // Violet clair
            'rgba(221, 214, 254, 0.06)', // Violet pâle
            'rgba(243, 232, 255, 0.04)'  // Violet très pâle
          ],
          flowSpeed: 0.8,
          waveHeight: 50,
          layers: 3
        }
      case 'romantic':
        return {
          colors: [
            'rgba(236, 72, 153, 0.1)',  // Rose
            'rgba(249, 168, 212, 0.08)', // Rose clair
            'rgba(252, 231, 243, 0.06)', // Rose pâle
            'rgba(253, 242, 248, 0.04)'  // Rose très pâle
          ],
          flowSpeed: 0.4,
          waveHeight: 25,
          layers: 6
        }
    }
  }

  const config = getThemeConfig()

  const drawWaveLayer = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    layerIndex: number
  ) => {
    const { colors, flowSpeed, waveHeight, layers } = config
    
    // Paramètres de la couche
    const layerOffset = (layerIndex / layers) * Math.PI * 2
    const layerSpeed = flowSpeed * (1 + layerIndex * 0.3)
    const amplitude = waveHeight * (1 - layerIndex * 0.15)
    const frequency = 0.01 + layerIndex * 0.002
    const yOffset = height * (0.3 + layerIndex * 0.1)
    
    // Influence de la souris
    const mouseInfluence = intensity * 0.3
    const mouseDistX = (mousePosition.x / width - 0.5) * mouseInfluence
    const mouseDistY = (mousePosition.y / height - 0.5) * mouseInfluence
    
    ctx.fillStyle = colors[layerIndex % colors.length]
    ctx.beginPath()
    
    // Point de départ
    ctx.moveTo(0, height)
    
    // Créer la forme ondulée
    for (let x = 0; x <= width; x += 2) {
      const baseWave = Math.sin(x * frequency + time * layerSpeed + layerOffset) * amplitude
      const secondaryWave = Math.cos(x * frequency * 2.1 + time * layerSpeed * 1.3) * amplitude * 0.3
      const mouseWave = Math.sin(x * 0.005 + time * 2) * mouseDistX * 20
      
      const y = yOffset + baseWave + secondaryWave + mouseWave + mouseDistY * 10
      
      ctx.lineTo(x, y)
    }
    
    // Fermer la forme
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.fill()
  }

  const drawParallaxElements = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
  ) => {
    // Éléments flottants
    const elementCount = 12
    
    for (let i = 0; i < elementCount; i++) {
      const x = (time * 0.2 * (1 + i * 0.1) + i * 100) % (width + 100) - 50
      const y = height * 0.2 + Math.sin(time * 0.5 + i) * 30
      const size = 2 + i % 3
      const opacity = 0.1 + (Math.sin(time + i) + 1) * 0.05
      
      ctx.fillStyle = config.colors[0].replace('0.1', opacity.toString())
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const animate = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // Effacer le canvas
    ctx.clearRect(0, 0, width, height)
    
    timeRef.current += 0.02
    
    // Dessiner les couches de vagues de l'arrière vers l'avant
    for (let i = config.layers - 1; i >= 0; i--) {
      drawWaveLayer(ctx, width, height, timeRef.current, i)
    }
    
    // Dessiner les éléments parallax
    drawParallaxElements(ctx, width, height, timeRef.current)
    
    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      }
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [theme, intensity]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Canvas pour les vagues animées */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Overlays de gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: theme === 'river' 
            ? 'radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
            : theme === 'ocean'
            ? 'radial-gradient(ellipse at 50% 100%, rgba(34, 197, 94, 0.1) 0%, transparent 70%)'
            : theme === 'waterfall'
            ? 'linear-gradient(180deg, rgba(168, 85, 247, 0.15) 0%, transparent 80%)'
            : 'radial-gradient(ellipse at 30% 50%, rgba(236, 72, 153, 0.08) 0%, transparent 60%)'
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Effet de lumière interactive */}
      <motion.div
        className="absolute rounded-full mix-blend-screen pointer-events-none"
        style={{
          left: mousePosition.x - 150,
          top: mousePosition.y - 150,
          width: 300,
          height: 300,
          background: `radial-gradient(circle, ${config.colors[0].replace('0.1', '0.03')} 0%, transparent 70%)`
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Particules de lumière */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${20 + Math.sin(i) * 30}%`
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.5, 0.5]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
          />
        ))}
      </div>
    </div>
  )
}

