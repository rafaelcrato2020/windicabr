import type React from "react"
import { Toaster } from "@/components/toaster"
import AdminSidebar from "./components/admin-sidebar"

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <AdminSidebar />
      <div className="flex-1 overflow-auto ml-0 lg:ml-64 pt-16 lg:pt-0">
        <main className="p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
