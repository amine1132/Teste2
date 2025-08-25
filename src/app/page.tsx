'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirection automatique vers l'intro
    router.push('/intro')
  }, [router])

  return (
    <div className="w-full h-screen flex items-center justify-center romantic-gradient">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
        <p className="text-white font-medium">Chargement de votre histoire d&apos;amour...</p>
      </div>
    </div>
  )
}
