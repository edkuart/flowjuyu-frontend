'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import UserProfileInfo from '@/components/profile/UserProfileInfo'
import AddressSection from '@/components/profile/AddressSection'
import OrderHistorySection from '@/components/profile/OrderHistorySection'
import FavoritesSection from '@/components/profile/FavoritesSection'
import ReviewSection from '@/components/profile/ReviewSection'
import StoreStatus from '@/components/profile/StoreStatus'

export default function PerfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') return <p className="p-4">Cargando...</p>
  if (!session?.user) return null

  const rawUser = session.user as {
    id: string
    name: string
    email: string
    image?: string
    role: 'comprador' | 'vendedor'
  }

  if (!rawUser?.id || !rawUser.name || !rawUser.email || !rawUser.role) {
    return <p className="text-red-500 p-4">Tu perfil no está completo. Intenta volver a iniciar sesión.</p>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <UserProfileInfo user={rawUser} />
      <AddressSection userId={rawUser.id} />

      {rawUser.role === 'comprador' && (
        <>
          <OrderHistorySection userId={rawUser.id} />
          <FavoritesSection userId={rawUser.id} />
          <ReviewSection userId={rawUser.id} />
        </>
      )}

      {rawUser.role === 'vendedor' && <StoreStatus userId={rawUser.id} />}
    </div>
  )
}
