'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

interface ParticleSystemProps {
  count?: number
  theme: 'love' | 'glacier' | 'river' | 'ocean' | 'earth'
  intensity?: number
  interactive?: boolean
  mousePosition?: { x: number; y: number }
}

function ParticleField({ count = 2000, theme, intensity = 1, interactive = false, mousePosition }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const mouseRef = useRef(new THREE.Vector3())

  // Configuration des couleurs par thème
  const themeConfig = useMemo(() => {
    switch (theme) {
      case 'love':
        return {
          colors: [0xff69b4, 0xff1493, 0xda70d6, 0xba55d3],
          size: 0.02,
          speed: 0.001
        }
      case 'glacier':
        return {
          colors: [0x87ceeb, 0x4682b4, 0x6495ed, 0xb0e0e6],
          size: 0.025,
          speed: 0.0008
        }
      case 'river':
        return {
          colors: [0x00ced1, 0x48d1cc, 0x20b2aa, 0x008b8b],
          size: 0.015,
          speed: 0.0012
        }
      case 'ocean':
        return {
          colors: [0x006994, 0x003f5c, 0x2d5aa0, 0x1f4e79],
          size: 0.03,
          speed: 0.0006
        }
      case 'earth':
        return {
          colors: [0x8b4513, 0xa0522d, 0xcd853f, 0xdaa520],
          size: 0.02,
          speed: 0.0005
        }
    }
  }, [theme])

  // Génération des positions et couleurs des particules
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Disposition en galaxy spirale
      const radius = Math.random() * 8
      const angle = Math.random() * Math.PI * 2
      const height = (Math.random() - 0.5) * 6

      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = height
      positions[i * 3 + 2] = Math.sin(angle) * radius

      // Couleur aléatoire du thème
      const color = new THREE.Color(themeConfig.colors[Math.floor(Math.random() * themeConfig.colors.length)])
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    return [positions, colors]
  }, [count, themeConfig])

  useFrame((state) => {
    if (!pointsRef.current) return

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
    const time = state.clock.elapsedTime

    // Mise à jour de la position de la souris
    if (interactive && mousePosition) {
      mouseRef.current.set(
        (mousePosition.x / window.innerWidth) * 2 - 1,
        -(mousePosition.y / window.innerHeight) * 2 + 1,
        0
      ).multiplyScalar(5)
    }

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      // Animation de base
      positions[i3 + 1] += Math.sin(time * themeConfig.speed + positions[i3]) * 0.01
      
      // Rotation générale
      const angle = time * themeConfig.speed * 0.5
      const radius = Math.sqrt(positions[i3] ** 2 + positions[i3 + 2] ** 2)
      positions[i3] = Math.cos(angle + i * 0.1) * radius
      positions[i3 + 2] = Math.sin(angle + i * 0.1) * radius

      // Interaction avec la souris
      if (interactive && mousePosition) {
        const particlePos = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2])
        const distance = particlePos.distanceTo(mouseRef.current)
        
        if (distance < 2) {
          const force = (2 - distance) * 0.02 * intensity
          const direction = particlePos.clone().sub(mouseRef.current).normalize()
          
          positions[i3] += direction.x * force
          positions[i3 + 1] += direction.y * force
          positions[i3 + 2] += direction.z * force
        }
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <Points ref={pointsRef} positions={positions} colors={colors}>
      <PointMaterial
        size={themeConfig.size * intensity}
        transparent
        opacity={0.8}
        sizeAttenuation
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </Points>
  )
}

// Composant pour les effets de profondeur
function DepthField({ theme }: { theme: ParticleSystemProps['theme'] }) {
  return (
    <>
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <ParticleField count={1000} theme={theme} intensity={0.6} />
      </Float>
      <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.3}>
        <ParticleField count={800} theme={theme} intensity={0.8} />
      </Float>
      <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.1}>
        <ParticleField count={1200} theme={theme} intensity={0.4} />
      </Float>
    </>
  )
}

export default function CinematicParticles({ 
  theme, 
  interactive = true, 
  mousePosition 
}: Omit<ParticleSystemProps, 'count'>) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        
        {interactive ? (
          <ParticleField 
            count={3000} 
            theme={theme} 
            intensity={1} 
            interactive={true}
            mousePosition={mousePosition}
          />
        ) : (
          <DepthField theme={theme} />
        )}
        
        {/* Brouillard pour la profondeur */}
        <fog attach="fog" args={['#000000', 5, 15]} />
      </Canvas>
    </div>
  )
}

