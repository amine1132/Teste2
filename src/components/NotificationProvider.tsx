'use client'

import { useEffect } from 'react'
import NotificationManager, { useNotifications } from './NotificationSystem'
import { setNotificationCallback } from '@/utils/easterEggs'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { notifications, addNotification, dismissNotification } = useNotifications()

  useEffect(() => {
    // Connecter le système d'easter eggs aux notifications
    setNotificationCallback(addNotification)
  }, [addNotification])

  return (
    <>
      {children}
      <NotificationManager 
        notifications={notifications} 
        onDismiss={dismissNotification} 
      />
    </>
  )
}

