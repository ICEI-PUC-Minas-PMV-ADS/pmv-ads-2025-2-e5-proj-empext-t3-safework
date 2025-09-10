import { HomeHeader } from '../../components/HomeHeader'
import { Hero } from '../../components/Hero'
import { Features } from '../../components/Features'
import { ProtectedRoute } from '../../components/ProtectedRoute'

export default function HomePage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen">
        <HomeHeader />
        <Hero />
        <Features />
      </main>
    </ProtectedRoute>
  )
}
