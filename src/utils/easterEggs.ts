// Type pour les callbacks de notification
type NotificationCallback = (notification: {
  title: string
  message: string
  type: 'easter-egg' | 'love' | 'milestone' | 'secret'
  duration?: number
}) => void

// Instance globale pour le callback de notification
let notificationCallback: NotificationCallback | null = null

// Fonction pour définir le callback de notification
export function setNotificationCallback(callback: NotificationCallback) {
  notificationCallback = callback
}

// Fonction utilitaire pour déclencher les Easter Eggs
export function triggerEasterEgg(chapterNumber?: number, message?: string) {
  const easterEggData = {
    1: {
      title: 'Premier Secret Découvert !',
      message: 'Tu as trouvé l\'étincelle de notre premier regard... 💖',
      type: 'easter-egg' as const
    },
    2: {
      title: 'Mots d\'Amour Révélés !',
      message: 'Les secrets de nos premières conversations sont à toi ! 💝',
      type: 'love' as const
    },
    3: {
      title: 'Engagement Éternel !',
      message: 'Tu as découvert la promesse de notre engagement ! 💍',
      type: 'milestone' as const
    },
    4: {
      title: 'Maître des Secrets !',
      message: 'Félicitations ! Tu connais maintenant tous nos mystères ! 🌟',
      type: 'secret' as const
    },
  }
  
  if (message && notificationCallback) {
    notificationCallback({
      title: 'Secret Découvert !',
      message,
      type: 'easter-egg',
      duration: 6000
    })
    return
  }
  
  if (chapterNumber && chapterNumber in easterEggData && notificationCallback) {
    const data = easterEggData[chapterNumber as keyof typeof easterEggData]
    notificationCallback({
      title: data.title,
      message: data.message,
      type: data.type,
      duration: 7000
    })
    
    // Marquer comme découvert
    easterEggState.markAsDiscovered(`chapter-${chapterNumber}`)
  } else if (notificationCallback) {
    notificationCallback({
      title: 'Surprise Trouvée !',
      message: 'Tu as découvert un secret de notre amour ! ✨',
      type: 'easter-egg',
      duration: 5000
    })
  }
  
  console.log(`Easter Egg activé - Chapitre ${chapterNumber || 'inconnu'}`)
}

// Liste des Easter Eggs découverts (pour tracking futur)
export const easterEggState = {
  discovered: new Set<string>(),
  
  markAsDiscovered(eggId: string) {
    this.discovered.add(eggId)
    console.log(`Easter Egg "${eggId}" ajouté à la collection !`)
  },
  
  isDiscovered(eggId: string) {
    return this.discovered.has(eggId)
  },
  
  getDiscoveredCount() {
    return this.discovered.size
  }
}
