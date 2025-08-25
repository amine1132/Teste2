'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import RiverFallback from './RiverFallback'

interface RealisticRiverProps {
  onInteractionProgress?: (progress: number) => void
  targetInteractions?: number
  intensity?: number
}



export default function RealisticRiver({ 
  onInteractionProgress, 
  targetInteractions = 100,
  intensity = 1
}: RealisticRiverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0, isPressed: false })
  const lastInteractionTime = useRef(0)
  const timeRef = useRef(0)
  const interactionCountRef = useRef(0)
  
  const [currentInteractions, setCurrentInteractions] = useState(0)
  const [isInteracting, setIsInteracting] = useState(false)
  const [performanceLevel, setPerformanceLevel] = useState<'high' | 'medium' | 'low'>('high')

  // Détection de performance pour adapter les effets
  const detectPerformance = useCallback(() => {
    // Test de performance basique pour Canvas 2D
    const isMobile = /iPad|iPhone|iPod|Android/i.test(navigator.userAgent)
    const hasHighPerf = window.devicePixelRatio >= 2
    
    if (isMobile && !hasHighPerf) {
      setPerformanceLevel('medium')
    } else if (isMobile) {
      setPerformanceLevel('medium')
    } else {
      setPerformanceLevel('high')
    }
  }, [])



  // Rendu Canvas 2D ultra-immersif avec effets avancés
  const renderCanvas2D = useCallback(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width / window.devicePixelRatio
    const height = canvas.height / window.devicePixelRatio
    
    // Effacer avec un fond sombre
    ctx.fillStyle = 'rgba(0, 10, 30, 0.95)'
    ctx.fillRect(0, 0, width, height)
    
    // === FOND DE RIVIÈRE AVEC PROFONDEUR ===
    
    // Gradient de profondeur principal
    const riverGradient = ctx.createLinearGradient(0, height * 0.15, 0, height * 0.85)
    riverGradient.addColorStop(0, 'rgba(20, 50, 120, 0.2)')
    riverGradient.addColorStop(0.3, 'rgba(30, 80, 180, 0.6)')
    riverGradient.addColorStop(0.5, 'rgba(40, 100, 220, 0.8)')
    riverGradient.addColorStop(0.7, 'rgba(30, 80, 180, 0.6)')
    riverGradient.addColorStop(1, 'rgba(20, 50, 120, 0.2)')
    
    ctx.fillStyle = riverGradient
    ctx.fillRect(0, height * 0.15, width, height * 0.7)
    
    // Effet de courant principal
    const flowGradient = ctx.createLinearGradient(-200 + (timeRef.current * 50) % (width + 400), 0, 200 + (timeRef.current * 50) % (width + 400), 0)
    flowGradient.addColorStop(0, 'rgba(80, 150, 255, 0)')
    flowGradient.addColorStop(0.5, 'rgba(80, 150, 255, 0.3)')
    flowGradient.addColorStop(1, 'rgba(80, 150, 255, 0)')
    
    ctx.fillStyle = flowGradient
    ctx.fillRect(0, height * 0.3, width, height * 0.4)
    
    // === VAGUES MULTICOUCHES AVEC RÉFLEXIONS ===
    
    const waveConfigs = [
      { y: 0.2, amp: 8, freq: 0.008, speed: 0.8, alpha: 0.15, width: 1 },
      { y: 0.25, amp: 12, freq: 0.012, speed: 1.2, alpha: 0.25, width: 1.5 },
      { y: 0.35, amp: 18, freq: 0.015, speed: 0.9, alpha: 0.4, width: 2 },
      { y: 0.45, amp: 25, freq: 0.018, speed: 1.5, alpha: 0.6, width: 2.5 },
      { y: 0.55, amp: 22, freq: 0.02, speed: 1.1, alpha: 0.5, width: 2.2 },
      { y: 0.65, amp: 16, freq: 0.016, speed: 1.3, alpha: 0.35, width: 1.8 },
      { y: 0.75, amp: 10, freq: 0.013, speed: 0.7, alpha: 0.2, width: 1.3 },
      { y: 0.8, amp: 6, freq: 0.01, speed: 0.5, alpha: 0.1, width: 0.8 }
    ]
    
    waveConfigs.forEach((wave, layerIndex) => {
      // Vague principale
      ctx.strokeStyle = `rgba(100, 180, 255, ${wave.alpha})`
      ctx.lineWidth = wave.width
      ctx.lineCap = 'round'
      ctx.shadowBlur = 10
      ctx.shadowColor = `rgba(100, 180, 255, ${wave.alpha * 0.5})`
      ctx.beginPath()
      
      for (let x = 0; x <= width; x += 1) {
        let baseY = height * wave.y
        let waveY = baseY + Math.sin(x * wave.freq + timeRef.current * wave.speed) * wave.amp
        
        // Ajouter du bruit secondaire pour plus de réalisme
        waveY += Math.sin(x * wave.freq * 2.3 + timeRef.current * wave.speed * 1.7) * wave.amp * 0.3
        waveY += Math.cos(x * wave.freq * 3.1 - timeRef.current * wave.speed * 0.8) * wave.amp * 0.15
        
        // Interaction souris ultra-réactive
        if (mouseRef.current.isPressed) {
          const dist = Math.sqrt(Math.pow(x - mouseRef.current.x, 2) + Math.pow(waveY - mouseRef.current.y, 2))
          const maxDist = 200 * intensity
          
          if (dist < maxDist) {
            const influence = (maxDist - dist) / maxDist
            const rippleFreq = 0.15
            const rippleSpeed = 4
            
            // Ondulations concentriques
            const concentricRipple = Math.sin(dist * rippleFreq - timeRef.current * rippleSpeed) * influence * 25 * intensity
            
            // Effet de dispersion
            const disperseEffect = Math.cos(dist * rippleFreq * 0.7 + timeRef.current * rippleSpeed * 1.3) * influence * 15 * intensity
            
            waveY += concentricRipple + disperseEffect
          }
        }
        
        if (x === 0) {
          ctx.moveTo(x, waveY)
        } else {
          ctx.lineTo(x, waveY)
        }
      }
      
      ctx.stroke()
      
      // Réflexion de la vague (effet miroir inversé)
      ctx.globalAlpha = wave.alpha * 0.3
      ctx.strokeStyle = `rgba(150, 200, 255, ${wave.alpha * 0.5})`
      ctx.lineWidth = wave.width * 0.6
      ctx.beginPath()
      
      for (let x = 0; x <= width; x += 2) {
        let baseY = height * wave.y
        let waveY = baseY - Math.sin(x * wave.freq + timeRef.current * wave.speed) * wave.amp * 0.4
        
        if (x === 0) {
          ctx.moveTo(x, waveY)
        } else {
          ctx.lineTo(x, waveY)
        }
      }
      
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
    })
    
    // === EFFETS INTERACTIFS AVANCÉS ===
    
    if (mouseRef.current.isPressed) {
      const mouseX = mouseRef.current.x
      const mouseY = mouseRef.current.y
      
      // Aura principale autour du curseur
      const auraGradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 150 * intensity)
      auraGradient.addColorStop(0, 'rgba(120, 200, 255, 0.6)')
      auraGradient.addColorStop(0.3, 'rgba(80, 160, 255, 0.4)')
      auraGradient.addColorStop(0.6, 'rgba(60, 140, 255, 0.2)')
      auraGradient.addColorStop(1, 'rgba(40, 120, 255, 0)')
      
      ctx.globalCompositeOperation = 'screen'
      ctx.fillStyle = auraGradient
      ctx.fillRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'source-over'
      
      // Particules orbitales complexes
      for (let ring = 0; ring < 3; ring++) {
        const ringRadius = 40 + ring * 25
        const particleCount = 6 + ring * 2
        
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + timeRef.current * (1.5 + ring * 0.5) + ring * 1.2
          const radius = ringRadius + Math.sin(timeRef.current * 3 + i + ring) * 8
          const x = mouseX + Math.cos(angle) * radius
          const y = mouseY + Math.sin(angle) * radius
          const size = 3 + Math.sin(timeRef.current * 4 + i + ring) * 1.5
          const alpha = 0.7 + Math.sin(timeRef.current * 5 + i + ring) * 0.3
          
          // Gradient pour chaque particule
          const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2)
          particleGradient.addColorStop(0, `rgba(180, 220, 255, ${alpha})`)
          particleGradient.addColorStop(0.7, `rgba(120, 180, 255, ${alpha * 0.6})`)
          particleGradient.addColorStop(1, `rgba(80, 140, 255, 0)`)
          
          ctx.fillStyle = particleGradient
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      
      // Étincelles aléatoires
      for (let i = 0; i < 12; i++) {
        const sparkleAngle = Math.random() * Math.PI * 2
        const sparkleRadius = 60 + Math.random() * 80
        const x = mouseX + Math.cos(sparkleAngle) * sparkleRadius
        const y = mouseY + Math.sin(sparkleAngle) * sparkleRadius
        const sparkleLife = (timeRef.current * 8 + i * 0.5) % (Math.PI * 2)
        const alpha = Math.max(0, Math.sin(sparkleLife)) * 0.8
        
        if (alpha > 0.1) {
          ctx.fillStyle = `rgba(200, 240, 255, ${alpha})`
          ctx.beginPath()
          ctx.arc(x, y, 1 + Math.sin(sparkleLife) * 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      
      // Vagues de choc concentriques
      for (let i = 1; i <= 4; i++) {
        const shockRadius = (timeRef.current * 80 + i * 30) % 200
        const shockAlpha = Math.max(0, 1 - shockRadius / 200) * 0.4
        
        if (shockAlpha > 0.05) {
          ctx.strokeStyle = `rgba(150, 210, 255, ${shockAlpha})`
          ctx.lineWidth = 2 * (1 - shockRadius / 200)
          ctx.beginPath()
          ctx.arc(mouseX, mouseY, shockRadius, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
    }
    
    // === PARTICULES FLOTTANTES AMBIENTES ===
    
    const floatingParticles = 15
    for (let i = 0; i < floatingParticles; i++) {
      const x = (width * 0.1 + (i * width * 0.8) / floatingParticles + Math.sin(timeRef.current * 0.5 + i) * 40) % width
      const y = height * (0.3 + Math.sin(timeRef.current * 0.3 + i * 0.8) * 0.25)
      const size = 1 + Math.sin(timeRef.current * 2 + i) * 0.5
      const alpha = 0.3 + Math.sin(timeRef.current * 1.5 + i * 1.2) * 0.2
      
      ctx.fillStyle = `rgba(120, 190, 255, ${alpha})`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // === REFLETS DE LUMIÈRE ANIMÉS ===
    
    // Reflet principal qui traverse la rivière
    const lightX = (timeRef.current * 30) % (width + 200) - 100
    const lightGradient = ctx.createLinearGradient(lightX - 100, 0, lightX + 100, 0)
    lightGradient.addColorStop(0, 'rgba(180, 220, 255, 0)')
    lightGradient.addColorStop(0.5, 'rgba(180, 220, 255, 0.2)')
    lightGradient.addColorStop(1, 'rgba(180, 220, 255, 0)')
    
    ctx.globalCompositeOperation = 'screen'
    ctx.fillStyle = lightGradient
    ctx.fillRect(lightX - 100, height * 0.2, 200, height * 0.6)
    ctx.globalCompositeOperation = 'source-over'
    
    timeRef.current += 0.016
  }, [intensity])

  // Animation principale
  const animate = useCallback(() => {
    renderCanvas2D()
    animationRef.current = requestAnimationFrame(animate)
  }, [renderCanvas2D])

  // Gestion des interactions
  const handleInteraction = useCallback((x: number, y: number) => {
    const now = Date.now()
    if (now - lastInteractionTime.current < 50) return // Throttling
    
    lastInteractionTime.current = now
    
    // Compter l'interaction
    interactionCountRef.current++
    setCurrentInteractions(interactionCountRef.current)
    onInteractionProgress?.(Math.min(interactionCountRef.current / targetInteractions, 1))
  }, [targetInteractions, onInteractionProgress])

  // Événements souris
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
    
    // Touch events pour iPad
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

  // Setup initial
  useEffect(() => {
    detectPerformance()
    
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio, performanceLevel === 'high' ? 2 : 1)
      
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      // Ajuster la mise à l'échelle pour le contexte 2D
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
    }
    
    resizeCanvas()
    animationRef.current = requestAnimationFrame(animate)
    
    window.addEventListener('resize', resizeCanvas)
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate, detectPerformance, performanceLevel])

  const progress = Math.min(currentInteractions / targetInteractions, 1)

  return (
    <div className="relative w-full h-full">
      {/* Canvas 2D pour la rivière */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Instructions immersives */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: progress < 0.8 ? 1 : 0, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="bg-gradient-to-r from-blue-900/60 via-purple-900/60 to-blue-900/60 backdrop-blur-xl rounded-3xl px-8 py-6 text-center border border-blue-400/40 shadow-2xl"
          animate={{
            boxShadow: [
              '0 0 30px rgba(59, 130, 246, 0.3)',
              '0 0 50px rgba(59, 130, 246, 0.5)',
              '0 0 30px rgba(59, 130, 246, 0.3)'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.p 
            className="text-white font-medium text-xl mb-3"
            style={{
              textShadow: '0 0 20px rgba(59, 130, 246, 0.8)'
            }}
          >
            ✨ Touche la rivière des émotions ✨
          </motion.p>
          <motion.p 
            className="text-blue-200 text-sm leading-relaxed"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Maintiens enfoncé et laisse ton amour<br/>
            créer des vagues magiques dans l'eau de notre histoire
          </motion.p>
          
          {/* Indicateur visuel du geste */}
          <motion.div 
            className="mt-4 flex justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🫧</span>
              </div>
              <motion.div
                className="absolute inset-0 bg-blue-400/30 rounded-full"
                animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Barre de progression cinématique */}
      <motion.div
        className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div 
          className="bg-gradient-to-r from-black/60 via-blue-900/50 to-black/60 backdrop-blur-xl rounded-2xl p-4 min-w-[380px] border border-blue-400/30"
          animate={{
            borderColor: ['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.6)', 'rgba(59, 130, 246, 0.3)']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <motion.span 
              className="text-blue-200 text-sm font-medium"
              style={{
                textShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
              }}
            >
              💧 Rivière des émotions partagées
            </motion.span>
            <motion.span 
              className="text-white text-sm font-bold"
              animate={{ 
                textShadow: progress > 0.8 
                  ? ['0 0 10px rgba(59, 130, 246, 0.8)', '0 0 20px rgba(59, 130, 246, 1)', '0 0 10px rgba(59, 130, 246, 0.8)']
                  : '0 0 5px rgba(59, 130, 246, 0.5)'
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {Math.round(progress * 100)}%
            </motion.span>
          </div>
          
          <div className="w-full bg-gradient-to-r from-black/40 via-blue-900/30 to-black/40 rounded-full h-3 relative overflow-hidden border border-blue-400/20">
            <motion.div
              className="h-3 rounded-full relative overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.8) 0%, rgba(147, 197, 253, 0.9) 30%, rgba(96, 165, 250, 1) 50%, rgba(147, 197, 253, 0.9) 70%, rgba(59, 130, 246, 0.8) 100%)'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.3 }}
            >
              {/* Effet de flux animé */}
              <motion.div
                className="absolute inset-0 h-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)'
                }}
                animate={{ x: [-150, 400] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Particules flottantes dans la barre */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/80 rounded-full"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                  animate={{
                    y: [-2, 2, -2],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                />
              ))}
            </motion.div>
          </div>
          
          <motion.div 
            className="text-center mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <span className="text-blue-300/70 text-xs">
              {currentInteractions}/{targetInteractions} gestes d'amour créés
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Badge de qualité premium */}
      <motion.div 
        className="absolute top-4 right-4 z-20"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <motion.div 
          className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-full border border-blue-400/50 shadow-lg"
          animate={{
            boxShadow: [
              '0 0 15px rgba(59, 130, 246, 0.4)',
              '0 0 25px rgba(59, 130, 246, 0.6)',
              '0 0 15px rgba(59, 130, 246, 0.4)'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ✨ Rendu HD Optimisé
        </motion.div>
      </motion.div>
    </div>
  )
}
