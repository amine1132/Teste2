'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface FluidParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  id: string
  opacity: number
}

interface FluidInteractionProps {
  onInteractionProgress?: (progress: number) => void
  theme?: 'river' | 'ocean' | 'waterfall'
  targetInteractions?: number
}

export default function FluidInteraction({ 
  onInteractionProgress, 
  theme = 'river',
  targetInteractions = 100 
}: FluidInteractionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<FluidParticle[]>([])
  const mouseRef = useRef({ x: 0, y: 0, isPressed: false })
  const lastMouseRef = useRef({ x: 0, y: 0 })
  const interactionCountRef = useRef(0)
  
  const [currentInteractions, setCurrentInteractions] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isInteracting, setIsInteracting] = useState(false)
  const [showRipple, setShowRipple] = useState(false)

  // Configuration des thèmes
  const getThemeConfig = () => {
    switch (theme) {
      case 'river':
        return {
          primaryColor: 'rgba(59, 130, 246, 0.8)',
          secondaryColor: 'rgba(96, 165, 250, 0.6)',
          accentColor: 'rgba(147, 197, 253, 0.4)',
          flowDirection: { x: 0.5, y: 0.1 },
          particleCount: 150,
          viscosity: 0.98
        }
      case 'ocean':
        return {
          primaryColor: 'rgba(34, 197, 94, 0.8)',
          secondaryColor: 'rgba(74, 222, 128, 0.6)',
          accentColor: 'rgba(134, 239, 172, 0.4)',
          flowDirection: { x: 0.2, y: 0.3 },
          particleCount: 200,
          viscosity: 0.95
        }
      case 'waterfall':
        return {
          primaryColor: 'rgba(168, 85, 247, 0.8)',
          secondaryColor: 'rgba(196, 181, 253, 0.6)',
          accentColor: 'rgba(221, 214, 254, 0.4)',
          flowDirection: { x: 0, y: 0.8 },
          particleCount: 180,
          viscosity: 0.92
        }
    }
  }

  const config = getThemeConfig()

  // Créer une nouvelle particule
  const createParticle = useCallback((x: number, y: number, isUserGenerated = false): FluidParticle => {
    const angle = Math.random() * Math.PI * 2
    const speed = isUserGenerated ? 2 + Math.random() * 3 : 0.5 + Math.random() * 1.5
    
    return {
      x,
      y,
      vx: Math.cos(angle) * speed + config.flowDirection.x,
      vy: Math.sin(angle) * speed + config.flowDirection.y,
      size: isUserGenerated ? 3 + Math.random() * 6 : 1 + Math.random() * 3,
      life: 0,
      maxLife: isUserGenerated ? 120 + Math.random() * 180 : 60 + Math.random() * 120,
      id: `${Date.now()}-${Math.random()}`,
      opacity: isUserGenerated ? 0.8 + Math.random() * 0.2 : 0.4 + Math.random() * 0.4
    }
  }, [config.flowDirection])

  // Initialiser les particules de base
  const initializeParticles = useCallback(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const particles: FluidParticle[] = []
    
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(createParticle(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      ))
    }
    
    particlesRef.current = particles
  }, [config.particleCount, createParticle])

  // Mettre à jour les particules
  const updateParticles = useCallback(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const mouse = mouseRef.current
    const particles = particlesRef.current
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]
      
      // Mise à jour de la vie
      particle.life++
      
      // Interaction avec la souris
      if (mouse.isPressed) {
        const dx = mouse.x - particle.x
        const dy = mouse.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 100) {
          const force = (100 - distance) / 100
          particle.vx += (dx / distance) * force * 0.5
          particle.vy += (dy / distance) * force * 0.5
        }
      }
      
      // Flux naturel
      particle.vx += config.flowDirection.x * 0.1
      particle.vy += config.flowDirection.y * 0.1
      
      // Viscosité
      particle.vx *= config.viscosity
      particle.vy *= config.viscosity
      
      // Position
      particle.x += particle.vx
      particle.y += particle.vy
      
      // Rebond sur les bords
      if (particle.x <= 0 || particle.x >= canvas.width) {
        particle.vx *= -0.8
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
      }
      if (particle.y <= 0 || particle.y >= canvas.height) {
        particle.vy *= -0.8
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))
      }
      
      // Supprimer les particules mortes
      if (particle.life >= particle.maxLife) {
        particles.splice(i, 1)
        
        // Créer une nouvelle particule pour maintenir le nombre
        if (particles.length < config.particleCount) {
          particles.push(createParticle(
            Math.random() * canvas.width,
            Math.random() * canvas.height
          ))
        }
      }
    }
  }, [config.flowDirection, config.viscosity, config.particleCount, createParticle])

  // Dessiner les particules
  const drawParticles = useCallback(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Dessiner le fond fluide
    const gradient = ctx.createRadialGradient(
      mouseRef.current.x, mouseRef.current.y, 0,
      mouseRef.current.x, mouseRef.current.y, 200
    )
    gradient.addColorStop(0, config.primaryColor.replace('0.8', '0.1'))
    gradient.addColorStop(1, 'transparent')
    
    if (mouseRef.current.isPressed) {
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    
    const particles = particlesRef.current
    
    // Dessiner les connexions entre particules proches
    ctx.strokeStyle = config.accentColor
    ctx.lineWidth = 1
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 80) {
          const opacity = (80 - distance) / 80 * 0.3
          ctx.globalAlpha = opacity
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    }
    
    // Dessiner les particules
    particles.forEach(particle => {
      const ageProgress = particle.life / particle.maxLife
      const opacity = particle.opacity * (1 - ageProgress * ageProgress)
      
      ctx.globalAlpha = opacity
      
      // Gradient pour chaque particule
      const particleGradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size
      )
      particleGradient.addColorStop(0, config.primaryColor)
      particleGradient.addColorStop(0.7, config.secondaryColor)
      particleGradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = particleGradient
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
    })
    
    ctx.globalAlpha = 1
  }, [config])

  // Boucle d'animation
  const animate = useCallback(() => {
    updateParticles()
    drawParticles()
    animationRef.current = requestAnimationFrame(animate)
  }, [updateParticles, drawParticles])

  // Gestion des événements de souris
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    mouseRef.current.x = x
    mouseRef.current.y = y
    setMousePosition({ x: e.clientX, y: e.clientY })
    
    // Créer des particules lors du mouvement avec pression
    if (mouseRef.current.isPressed) {
      const dx = x - lastMouseRef.current.x
      const dy = y - lastMouseRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance > 5) {
        // Créer plusieurs particules le long du chemin
        const steps = Math.floor(distance / 10)
        for (let i = 0; i < steps; i++) {
          const progress = i / steps
          const px = lastMouseRef.current.x + dx * progress
          const py = lastMouseRef.current.y + dy * progress
          
          particlesRef.current.push(createParticle(px, py, true))
        }
        
        interactionCountRef.current++
        setCurrentInteractions(interactionCountRef.current)
        onInteractionProgress?.(Math.min(interactionCountRef.current / targetInteractions, 1))
        
        lastMouseRef.current = { x, y }
      }
    }
  }, [createParticle, targetInteractions, onInteractionProgress])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    mouseRef.current.isPressed = true
    setIsInteracting(true)
    setShowRipple(true)
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      lastMouseRef.current = { x, y }
    }
  }, [])

  const handleMouseUp = useCallback(() => {
    mouseRef.current.isPressed = false
    setIsInteracting(false)
    setShowRipple(false)
  }, [])

  // Setup du canvas et événements
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
    initializeParticles()
    
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [initializeParticles, handleMouseMove, handleMouseDown, handleMouseUp, animate])

  const progress = Math.min(currentInteractions / targetInteractions, 1)

  return (
    <div className="relative w-full h-full">
      {/* Canvas principal pour les particules fluides */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Effet de ripple au curseur */}
      {showRipple && (
        <motion.div
          className="fixed pointer-events-none z-20 rounded-full border-2"
          style={{
            left: mousePosition.x - 25,
            top: mousePosition.y - 25,
            width: 50,
            height: 50,
            borderColor: config.primaryColor,
            background: `radial-gradient(circle, ${config.primaryColor.replace('0.8', '0.2')} 0%, transparent 70%)`
          }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.8, 0.2, 0.8]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      )}
      
      {/* Instructions interactives */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: progress < 0.8 ? 1 : 0, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-white/20">
          <p className="text-white font-medium text-lg mb-2">
            Maintiens enfoncé pour conduire le flux des rivières
          </p>
          <p className="text-white/70 text-sm">
            Laisse ton curseur guider les eaux vers leur destinée
          </p>
        </div>
      </motion.div>
      
      {/* Barre de progression fluide */}
      <motion.div
        className="absolute top-8 left-1/2 transform -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-black/20 backdrop-blur-sm rounded-full p-3 min-w-[300px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm">
              Flux des rivières ({currentInteractions}/{targetInteractions})
            </span>
            <span className="text-white text-sm font-bold">
              {Math.round(progress * 100)}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 relative overflow-hidden">
            <motion.div
              className="h-2 rounded-full relative"
              style={{
                background: `linear-gradient(90deg, ${config.primaryColor} 0%, ${config.secondaryColor} 50%, ${config.accentColor} 100%)`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.3 }}
            >
              {/* Effet de flow */}
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

