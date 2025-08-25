'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

interface Notification {
  id: string
  title: string
  message: string
  type: 'easter-egg' | 'love' | 'milestone' | 'secret'
  duration?: number
}

interface NotificationManagerProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

// Particules flottantes pour l'effet immersif
function FloatingParticles({ isVisible }: { isVisible: boolean }) {
  const particlesRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (particlesRef.current && isVisible) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.3
      particlesRef.current.children.forEach((child, index) => {
        const particle = child as THREE.Mesh
        particle.position.y += Math.sin(state.clock.elapsedTime + index) * 0.01
      })
    }
  })

  return (
    <group ref={particlesRef}>
      {Array.from({ length: 15 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 4
          ]}
        >
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#f9a8d4" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// Composant pour une notification individuelle
function NotificationCard({ notification, onDismiss }: { 
  notification: Notification, 
  onDismiss: (id: string) => void 
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'easter-egg':
        return {
          bg: 'from-yellow-400/90 to-orange-500/90',
          border: 'border-yellow-300/50',
          emoji: '✨',
          glow: 'shadow-yellow-400/30'
        }
      case 'love':
        return {
          bg: 'from-pink-400/90 to-rose-500/90',
          border: 'border-pink-300/50',
          emoji: '💖',
          glow: 'shadow-pink-400/30'
        }
      case 'milestone':
        return {
          bg: 'from-purple-400/90 to-indigo-500/90',
          border: 'border-purple-300/50',
          emoji: '🌟',
          glow: 'shadow-purple-400/30'
        }
      case 'secret':
        return {
          bg: 'from-emerald-400/90 to-teal-500/90',
          border: 'border-emerald-300/50',
          emoji: '💎',
          glow: 'shadow-emerald-400/30'
        }
      default:
        return {
          bg: 'from-gray-400/90 to-gray-500/90',
          border: 'border-gray-300/50',
          emoji: '💌',
          glow: 'shadow-gray-400/30'
        }
    }
  }

  const style = getNotificationStyle(notification.type)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        opacity: { duration: 0.3 }
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        relative overflow-hidden rounded-2xl p-6 max-w-sm backdrop-blur-xl
        bg-gradient-to-r ${style.bg} ${style.border} border-2
        ${style.glow} shadow-2xl cursor-pointer
      `}
      onClick={() => onDismiss(notification.id)}
    >
      {/* Particules de fond */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 3] }}>
          <FloatingParticles isVisible={isHovered} />
        </Canvas>
      </div>

      <div className="relative z-10">
        <div className="flex items-start space-x-3">
          <motion.div
            animate={{ 
              rotate: isHovered ? 360 : 0,
              scale: isHovered ? 1.2 : 1
            }}
            transition={{ duration: 0.6 }}
            className="text-3xl"
          >
            {style.emoji}
          </motion.div>
          
          <div className="flex-1">
            <motion.h3 
              className="font-display text-lg font-bold text-white mb-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {notification.title}
            </motion.h3>
            
            <motion.p 
              className="text-white/90 text-sm leading-relaxed"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {notification.message}
            </motion.p>
          </div>
        </div>

        {/* Indicateur de fermeture */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute top-2 right-2 text-white/60 text-xs"
        >
          Cliquer pour fermer
        </motion.div>

        {/* Effet de brillance */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered ? '100%' : '-100%' }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </motion.div>
  )
}

// Gestionnaire principal des notifications
export default function NotificationManager({ notifications, onDismiss }: NotificationManagerProps) {
  return (
    <div className="fixed top-6 right-6 z-50 space-y-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationCard 
              notification={notification} 
              onDismiss={onDismiss}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook pour gérer les notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    
    setNotifications(prev => [...prev, newNotification])

    // Auto-suppression après la durée spécifiée
    if (notification.duration !== 0) {
      setTimeout(() => {
        dismissNotification(id)
      }, notification.duration || 5000)
    }
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications
  }
}

