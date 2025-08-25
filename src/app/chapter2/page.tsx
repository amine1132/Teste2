'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { triggerEasterEgg } from '@/utils/easterEggs'
import RealisticRiver from '@/components/RealisticRiver'
import CinematicBackground from '@/components/CinematicBackground'
import MusicPlayer from '@/components/MusicPlayer'

// Interface pour les messages romantiques
interface RomanticMessage {
  id: string
  text: string
  author: 'you' | 'them'
  timestamp: number
}



export default function Chapter2() {
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<'introduction' | 'interaction' | 'messages' | 'complete'>('introduction')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [visibleMessages, setVisibleMessages] = useState<RomanticMessage[]>([])
  
  // Messages romantiques à révéler progressivement
  const romanticMessages: RomanticMessage[] = [
    { id: '1', text: 'Salut, syrielle m\'a donné ton numéro. Elle m\'a dit beaucoupd de bien sur toi, alors je me sit que ça serait sympa qu\'on fasse connaissance. Tu va bien ?', author:'you', timestamp: 1 },
    { id: '2', text: 'Ptdrrrr je vais la tuer', author: 'them', timestamp: 2 },
    { id: '3', text: 'Elle m\'a aussi parlé de toi mdrr ça va super et toi?', author: 'them', timestamp: 2 },
    { id: '4', text: 'Mdrrrrrr ah bon ça va un crever à cause du sport mais sinon ça va en parlant de ça tu fait du sport ou t\'en a déjà fait auparavant?', author: 'you', timestamp: 3 },
    { id: '5', text: 'j\'en fais plus mais j\'en faisais bcp avant', author: 'them', timestamp: 4 },
    { id: '6', text: 'je vois ta des passions ou des trucs que tu aimes faire pendant le week-end', author: 'you', timestamp: 5 },
    { id: '7', text: 'Mdrrrrr pas vraiment, en ce moment c\'est surtout cours/stage sinon en temps normal je passe bcp de temps avec ma famille', author: 'them', timestamp: 6 },
    { id: '7', text: 'Et toi?', author: 'them', timestamp: 6 },
  ]

  const handleInteractionProgress = (newProgress: number) => {
    setProgress(newProgress)
    
    if (newProgress >= 0.2 && currentPhase === 'introduction') {
      setCurrentPhase('interaction')
    }
    
    if (newProgress >= 0.5 && currentPhase === 'interaction') {
      setCurrentPhase('messages')
      startRevealingMessages()
    }
    
    if (newProgress >= 1 && !isCompleted) {
      setCurrentPhase('complete')
      setIsCompleted(true)
    }
  }

  const startRevealingMessages = () => {
    romanticMessages.forEach((message, index) => {
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, message])
      }, index * 2000)
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      {/* Background cinématique */}
      <CinematicBackground 
        theme="river" 
        intensity={1 + progress}
        mousePosition={mousePosition}
      />
      
      {/* Rivière réaliste WebGL */}
      <div className="absolute inset-0 z-10">
        <RealisticRiver 
          onInteractionProgress={handleInteractionProgress}
          targetInteractions={100}
          intensity={1 + progress * 0.5}
        />
      </div>

      {/* Lecteur de musique pour Cover Your Tracks */}
      <MusicPlayer 
        autoplay={true}
        volume={0.4}
        showControls={true}
        playlist="cover-tracks"
      />

      {/* Header cinématique */}
      <motion.header 
        className="absolute top-0 left-0 right-0 z-20 p-8"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="text-center">
          <motion.h1 
            className="font-display text-6xl md:text-7xl font-bold text-white"
            style={{
              textShadow: '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.3)'
            }}
            animate={{ 
              textShadow: currentPhase === 'interaction' || currentPhase === 'messages'
                ? '0 0 40px rgba(59, 130, 246, 0.8), 0 0 80px rgba(59, 130, 246, 0.6)' 
                : '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.3)'
            }}
          >
            Le Rythme des Rivières
          </motion.h1>
          <motion.p 
            className="text-xl text-white/80 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Quand nos âmes se sont parlé pour la première fois
          </motion.p>
        </div>
      </motion.header>

      {/* Zone des messages romantiques */}
      <AnimatePresence>
        {currentPhase === 'messages' && (
          <motion.div
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-25 w-full max-w-2xl px-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/20 max-h-96 overflow-y-auto">
              <motion.h3 
                className="text-white text-2xl font-bold text-center mb-6"
                style={{
                  textShadow: '0 0 20px rgba(59, 130, 246, 0.6)'
                }}
              >
                💕 Nos premiers mots d'amour 💕
              </motion.h3>
              
              <div className="space-y-4">
                {visibleMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.author === 'you' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 20, x: message.author === 'you' ? 50 : -50 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <div 
                      className={`max-w-xs p-4 rounded-2xl ${
                        message.author === 'you' 
                          ? 'bg-gradient-to-r from-blue-500/80 to-blue-600/80 text-white ml-8' 
                          : 'bg-white/90 text-gray-800 mr-8'
                      }`}
                      style={{
                        boxShadow: message.author === 'you' 
                          ? '0 0 20px rgba(59, 130, 246, 0.4)' 
                          : '0 0 20px rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      
                      {/* Indicateur d'auteur */}
                      <div className={`mt-2 text-xs opacity-70 ${
                        message.author === 'you' ? 'text-right' : 'text-left'
                      }`}>
                        {message.author === 'you' ? 'L\'amour de ma vie' : 'Moi'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Typing indicator */}
              {visibleMessages.length < romanticMessages.length && (
                <motion.div 
                  className="flex justify-start mt-4"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="bg-white/80 rounded-2xl px-4 py-3 mr-8">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Easter Egg caché */}
            <motion.button
              onClick={() => triggerEasterEgg(2)}
              className="opacity-20 hover:opacity-100 transition-opacity duration-300 text-xs absolute bottom-4 left-4"
              whileHover={{ scale: 1.2 }}
            >
              💌
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message de complétion */}
      <AnimatePresence>
        {currentPhase === 'complete' && (
          <motion.div
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl px-8 py-6 text-center border border-blue-400/30">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  textShadow: [
                    '0 0 20px rgba(59, 130, 246, 0.6)',
                    '0 0 40px rgba(59, 130, 246, 0.8)',
                    '0 0 20px rgba(59, 130, 246, 0.6)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <h4 className="text-white text-2xl font-bold mb-4">✨ Chapitre Complété ✨</h4>
              </motion.div>
              <p className="text-white/80 mb-6">
                Tu as guidé le flux des rivières de vos premiers mots d'amour...
              </p>
              <p className="text-blue-300 text-sm">
                Prêt à découvrir la suite de votre histoire ?
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <motion.nav 
        className="absolute bottom-8 left-0 right-0 z-30 px-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className="flex justify-between items-center">
          <Link href="/chapter1">
            <motion.button
              className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full font-medium border border-white/20"
              whileHover={{ 
                scale: 1.05,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              ← Précédent
            </motion.button>
          </Link>
          
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-white/30 rounded-full"></div>
            <motion.div 
              className="w-3 h-3 bg-blue-400 rounded-full"
              animate={{ 
                boxShadow: ['0 0 5px rgba(59, 130, 246, 0.5)', '0 0 15px rgba(59, 130, 246, 0.8)', '0 0 5px rgba(59, 130, 246, 0.5)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            ></motion.div>
            <div className="w-3 h-3 bg-white/30 rounded-full"></div>
            <div className="w-3 h-3 bg-white/30 rounded-full"></div>
          </div>
          
          <Link href="/chapter3">
            <motion.button
              className={`px-6 py-3 rounded-full font-medium border transition-all duration-300 ${
                isCompleted 
                  ? 'bg-blue-500/80 text-white border-blue-400/50' 
                  : 'bg-white/10 text-white/50 border-white/20 cursor-not-allowed'
              }`}
              whileHover={isCompleted ? { 
                scale: 1.05,
                backgroundColor: 'rgba(59, 130, 246, 0.9)',
                boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)'
              } : {}}
              whileTap={isCompleted ? { scale: 0.95 } : {}}
              style={{ pointerEvents: isCompleted ? 'auto' : 'none' }}
            >
              Suivant →
            </motion.button>
          </Link>
        </div>
      </motion.nav>
    </motion.div>
  )
}
