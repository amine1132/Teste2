'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MusicPlayerProps {
  autoplay?: boolean
  volume?: number
  showControls?: boolean
  playlist?: 'firework' | 'cover-tracks' | 'default'
}

export default function MusicPlayer({ 
  autoplay = false, 
  volume = 0.3,
  showControls = true,
  playlist = 'default'
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const playMusic = useCallback(async () => {
    if (audioRef.current) {
      try {
        audioRef.current.volume = isMuted ? 0 : volume
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.log('Erreur lors de la lecture audio:', error)
        setIsPlaying(false)
      }
    }
  }, [isMuted, volume])

  const pauseMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggleMusic = () => {
    if (isPlaying) {
      pauseMusic()
    } else {
      playMusic()
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted
      setIsMuted(newMutedState)
      audioRef.current.volume = newMutedState ? 0 : volume
    }
  }

  const hideControls = () => {
    setIsVisible(false)
    setTimeout(() => setIsVisible(true), 3000) // Réapparaît après 3 secondes
  }

  useEffect(() => {
    if (autoplay && audioRef.current) {
      // Délai pour permettre l'interaction utilisateur d'abord
      const timer = setTimeout(() => {
        playMusic()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [autoplay, volume, playMusic])

  return (
    <>
      {/* Audio élément */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          console.log('Fichier audio non trouvé - utilisation d\'un fichier de secours')
          setIsPlaying(false)
        }}
                    >
        {playlist === 'firework' && (
          <>
            <source src="/music/KatyPerry-Firework(Lyrics).mp3" type="audio/mpeg" />
            <source src="/music/Cover Your Tracks.mp3" type="audio/mpeg" />
            <source src="/music/drawing-music.mp3" type="audio/mpeg" />
          </>
        )}
        {playlist === 'cover-tracks' && (
          <>
            <source src="/music/Cover Your Tracks.mp3" type="audio/mpeg" />
            <source src="/music/KatyPerry-Firework(Lyrics).mp3" type="audio/mpeg" />
            <source src="/music/drawing-music.mp3" type="audio/mpeg" />
          </>
        )}
        {playlist === 'default' && (
          <>
            <source src="/music/KatyPerry-Firework(Lyrics).mp3" type="audio/mpeg" />
            <source src="/music/Cover Your Tracks.mp3" type="audio/mpeg" />
            <source src="/music/drawing-music.mp3" type="audio/mpeg" />
          </>
        )}
        {/* Fallback pour les navigateurs qui ne supportent pas audio */}
        Votre navigateur ne supporte pas l&apos;audio HTML5.
      </audio>

      {/* Contrôles audio */}
      <AnimatePresence>
        {showControls && isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center space-x-3"
          >
            {/* Bouton Play/Pause */}
            <motion.button
              onClick={toggleMusic}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black/30 backdrop-blur-sm text-white p-3 rounded-full border border-white/20 hover:bg-black/50 transition-colors"
              title={isPlaying ? 'Pause la musique' : 'Jouer la musique'}
            >
              {isPlaying ? (
                // Icône Pause
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                // Icône Play
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </motion.button>

            {/* Bouton Mute/Unmute */}
            <motion.button
              onClick={toggleMute}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black/30 backdrop-blur-sm text-white p-3 rounded-full border border-white/20 hover:bg-black/50 transition-colors"
              title={isMuted ? 'Activer le son' : 'Couper le son'}
            >
              {isMuted ? (
                // Icône Muted
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              ) : (
                // Icône Volume
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </motion.button>

            {/* Bouton Masquer */}
            <motion.button
              onClick={hideControls}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black/30 backdrop-blur-sm text-white p-2 rounded-full border border-white/20 hover:bg-black/50 transition-colors"
              title="Masquer les contrôles"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicateur de musique si contrôles masqués */}
      <AnimatePresence>
        {showControls && !isVisible && isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsVisible(true)}
            className="fixed bottom-6 right-6 z-50 cursor-pointer"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="bg-pink-500/30 backdrop-blur-sm text-white p-3 rounded-full border border-pink-300/30"
              title="Cliquer pour afficher les contrôles"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
