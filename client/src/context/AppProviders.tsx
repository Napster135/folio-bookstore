import { type ReactNode } from 'react'
import { ToastProvider } from './ToastContext'
import { GuestCartProvider } from './GuestCartContext'
import { UserProvider } from './UserContext'
import { FavoritesProvider } from './FavoritesContext'
import { ConciergeProvider } from './ConciergeContext'

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <GuestCartProvider>
        <UserProvider>
          <FavoritesProvider>
            <ConciergeProvider>
              {children}
            </ConciergeProvider>
          </FavoritesProvider>
        </UserProvider>
      </GuestCartProvider>
    </ToastProvider>
  )
}
