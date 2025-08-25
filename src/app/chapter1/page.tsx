'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { triggerEasterEgg } from '@/utils/easterEggs'
import InteractiveChapter from '@/components/InteractiveChapter'
import SimpleCursor from '@/components/SimpleCursor'
import CinematicParticles from '@/components/CinematicParticles'
import MusicPlayer from '@/components/MusicPlayer'

export default function Chapter1() {
  const [interactionComplete, setInteractionComplete] = useState(false)
  const [interactionCount, setInteractionCount] = useState(0)
  const [mousePosition] = useState({ x: 0, y: 0 })
  const [useSimpleMode, setUseSimpleMode] = useState(false) // Toggle pour tester

  const handleInteractionComplete = () => {
    setInteractionComplete(true)
    triggerEasterEgg(1)
  }

  const handleSimpleInteraction = (x: number, y: number, pressure: number) => {
    setInteractionCount(prev => prev + 1)
    
    if (interactionCount >= 149 && !interactionComplete) {
      handleInteractionComplete()
    }
  }

  // Version simple pour debug PC
  if (useSimpleMode) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-pink-900 via-purple-900 to-black">
        <CinematicParticles theme="love" interactive={true} mousePosition={mousePosition} />
        <SimpleCursor onInteraction={handleSimpleInteraction} />
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-8">
          <h1 className="text-6xl font-bold text-white mb-8">Premier Regard</h1>
          <p className="text-xl text-white/80 mb-8 text-center max-w-2xl">
            Clique et maintiens enfoncé pour dessiner notre histoire d&apos;amour...
          </p>
          
          <div className="bg-black/30 rounded-lg p-4 mb-8">
            <p className="text-white">Interactions: {interactionCount}/150</p>
            <div className="w-64 bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-pink-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(interactionCount / 150 * 100, 100)}%` }}
              />
            </div>
          </div>

          {interactionComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="text-2xl text-pink-400 mb-4">✨ Histoire débloquée ! ✨</p>
              <Link href="/chapter2">
                <button className="bg-pink-500 text-white px-8 py-3 rounded-full hover:bg-pink-600 transition-colors">
                  Chapitre suivant →
                </button>
              </Link>
            </motion.div>
          )}

          <button 
            onClick={() => setUseSimpleMode(false)}
            className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Mode Avancé
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setUseSimpleMode(true)}
        className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Mode Simple (Debug PC)
      </button>
      
      {/* Lecteur de musique */}
      <MusicPlayer 
        autoplay={true}
        volume={0.4}
        showControls={true}
        playlist="firework"
      />
      
      <InteractiveChapter
        chapterNumber={1}
        title="Premier Regard"
        subtitle="L'étincelle qui a tout changé"
        instruction="Dessine les contours de notre première rencontre"
        theme="love"
        onInteractionComplete={handleInteractionComplete}
      >
      {/* Contenu central */}
      <div className="flex items-center justify-center px-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 max-w-3xl mx-auto text-center border border-white/10 immersive-glow"
        >
          <motion.h2 
            className="font-display text-4xl mb-6 text-white text-glow"
            animate={{ 
              textShadow: interactionComplete
                ? '0 0 30px rgba(236,72,153,0.8), 0 0 60px rgba(168,85,247,0.6)'
                : '0 0 15px rgba(255,255,255,0.6)'
            }}
          >
            Le commencement de tout
          </motion.h2>
          
          <motion.p 
            className="text-white/90 leading-relaxed mb-8 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            Dans ce moment magique où le temps s&apos;est arrêté, 
            j&apos;ai su que ma vie allait changer à jamais. 
            Ton sourire a illuminé mon monde et créé une symphonie 
            d&apos;émotions que je ressens encore aujourd&apos;hui...
          </motion.p>

          {/* Révélation progressive du contenu */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: interactionComplete ? 1 : 0,
              height: interactionComplete ? 'auto' : 0
            }}
            transition={{ duration: 1, delay: 0.5 }}
            className="overflow-hidden"
          >
            <div className="bg-white/5 rounded-2xl p-6 mt-6 border border-white/10">
              <p className="text-romantic-pink text-sm font-medium mb-2">
                ✨ Souvenir débloqué
              </p>
              <p className="text-white/80 text-sm italic">
                &quot;Ce regard que tu m&apos;as lancé... j&apos;ai compris que plus rien 
                ne serait jamais pareil. Tu as sculpté ton chemin dans mon cœur 
                comme ton curseur vient de dessiner cette histoire.&quot;
              </p>
            </div>
          </motion.div>

          {/* Easter Egg caché mais plus accessible */}
          <motion.button
            onClick={() => triggerEasterEgg(1, "Tu as trouvé notre secret ! Ce premier regard continue de briller dans nos cœurs... 💖")}
            className="absolute top-4 right-4 opacity-20 hover:opacity-100 transition-all duration-500 text-2xl hover-lift"
            whileHover={{ scale: 1.2, rotate: 360 }}
            whileTap={{ scale: 0.9 }}
          >
            ✨
          </motion.button>
        </motion.div>
      </div>

      {/* Navigation élégante */}
      <motion.nav 
        className="absolute bottom-8 left-0 right-0 z-30 px-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <div className="flex justify-between items-center">
          <Link href="/intro">
            <motion.button
              className="px-8 py-4 bg-black/30 text-white/90 rounded-full font-medium backdrop-blur-sm border border-white/20 touch-feedback hover-lift"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(0,0,0,0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              ← Retour à l&apos;intro
            </motion.button>
          </Link>
          
          {/* Indicateur de progression stylisé */}
          <div className="flex space-x-3">
            <motion.div 
              className="w-4 h-4 bg-romantic-pink rounded-full shadow-lg"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="w-4 h-4 bg-white/30 rounded-full" />
            <div className="w-4 h-4 bg-white/30 rounded-full" />
            <div className="w-4 h-4 bg-white/30 rounded-full" />
          </div>
          
          <Link href="/chapter2">
            <motion.button
              className={`px-8 py-4 rounded-full font-medium backdrop-blur-sm border transition-all duration-500 touch-feedback hover-lift ${
                interactionComplete 
                  ? 'bg-romantic-pink text-white border-romantic-pink/50 pulse-glow' 
                  : 'bg-black/30 text-white/60 border-white/20 cursor-not-allowed'
              }`}
              whileHover={interactionComplete ? { scale: 1.05 } : {}}
              whileTap={interactionComplete ? { scale: 0.95 } : {}}
              disabled={!interactionComplete}
            >
              {interactionComplete ? 'Continuer l\'histoire →' : 'Termine d\'abord cette étape'}
            </motion.button>
          </Link>
        </div>
      </motion.nav>
    </InteractiveChapter>
    </div>
  )
}
