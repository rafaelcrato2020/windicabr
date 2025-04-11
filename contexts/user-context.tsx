"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface UserContextType {
  profilePhoto: string | null
  setProfilePhoto: (photo: string | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)

  return <UserContext.Provider value={{ profilePhoto, setProfilePhoto }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
