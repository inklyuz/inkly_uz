import { ProtectedRoute } from '@/components/auth/protected-route'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-white">
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
