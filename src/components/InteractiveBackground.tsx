'use client'

import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface MousePosition {
  x: number
  y: number
}

// Composant pour les particules qui réagissent au curseur
function ReactiveParticles({ mousePosition }: { mousePosition: MousePosition }) {
  const particlesRef = useRef<THREE.Group>(null)
  const mouseRef = useRef<THREE.Vector3>(new THREE.Vector3())

  useFrame((state) => {
    if (particlesRef.current) {
      // Rotation générale lente
      particlesRef.current.rotation.y += 0.001

      // Convertir la position de la souris en coordonnées 3D
      mouseRef.current.set(
        (mousePosition.x / window.innerWidth) * 2 - 1,
        -(mousePosition.y / window.innerHeight) * 2 + 1,
        0
      )

      // Faire réagir chaque particule au curseur
      particlesRef.current.children.forEach((child, index) => {
        const particle = child as THREE.Mesh
        const distance = particle.position.distanceTo(mouseRef.current)
        
        // Attraction/répulsion basée sur la distance
        if (distance < 3) {
          const force = (3 - distance) * 0.02
          const direction = new THREE.Vector3()
            .subVectors(particle.position, mouseRef.current)
            .normalize()
          
          particle.position.add(direction.multiplyScalar(force))
        }

        // Animation de flottement naturel
        particle.position.y += Math.sin(state.clock.elapsedTime + index) * 0.002
        particle.rotation.z += 0.01
        
        // Effet de pulsation
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1
        particle.scale.setScalar(scale)
      })
    }
  })

  return (
    <group ref={particlesRef}>
      {Array.from({ length: 50 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 10
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial 
            color={new THREE.Color().setHSL(
              0.8 + Math.random() * 0.2, // Teintes roses/violettes
              0.6,
              0.5 + Math.random() * 0.3
            )}
            transparent 
            opacity={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

// Vagues fluides en arrière-plan
function FluidWaves({ mousePosition }: { mousePosition: MousePosition }) {
  const waveRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (waveRef.current) {
      const geometry = waveRef.current.geometry as THREE.PlaneGeometry
      const positions = geometry.attributes.position.array as Float32Array

      // Effet de vague influencé par la souris
      const mouseInfluence = new THREE.Vector2(
        (mousePosition.x / window.innerWidth - 0.5) * 2,
        (mousePosition.y / window.innerHeight - 0.5) * 2
      )

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i]
        const y = positions[i + 1]
        
        // Distance par rapport à la souris
        const mouseDistance = Math.sqrt(
          (x - mouseInfluence.x * 5) ** 2 + 
          (y - mouseInfluence.y * 5) ** 2
        )
        
        // Vague basique + influence de la souris
        positions[i + 2] = 
          Math.sin(x * 0.5 + state.clock.elapsedTime) * 0.3 +
          Math.cos(y * 0.3 + state.clock.elapsedTime * 0.7) * 0.2 +
          Math.sin(mouseDistance * 2 - state.clock.elapsedTime * 2) * 0.1
      }

      geometry.attributes.position.needsUpdate = true
      geometry.computeVertexNormals()
    }
  })

  return (
    <mesh ref={waveRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[20, 20, 32, 32]} />
      <meshBasicMaterial 
        color="#f9a8d4" 
        transparent 
        opacity={0.1}
        wireframe
      />
    </mesh>
  )
}

// Composant principal pour le fond interactif
export default function InteractiveBackground({ 
  children, 
  intensity = 1 
}: { 
  children: React.ReactNode
  intensity?: number 
}) {
  const mousePosition = useRef<MousePosition>({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mousePosition.current = { 
          x: e.touches[0].clientX, 
          y: e.touches[0].clientY 
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      {/* Canvas 3D en arrière-plan */}
      <div className="absolute inset-0 z-0">
        <Canvas 
          camera={{ position: [0, 0, 8], fov: 60 }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={0.3} />
          
          <ReactiveParticles mousePosition={mousePosition.current} />
          <FluidWaves mousePosition={mousePosition.current} />
        </Canvas>
      </div>

      {/* Contenu par-dessus */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

