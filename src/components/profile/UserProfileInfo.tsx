'use client'

import Image from 'next/image'

interface User {
  id: string
  name: string
  email: string
  image?: string
  role: 'comprador' | 'vendedor'
}

export default function UserProfileInfo({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-4 border p-4 rounded bg-white shadow">
      {user.image && (
        <Image
          src={user.image}
          alt={user.name}
          width={64}
          height={64}
          className="rounded-full"
        />
      )}
      <div>
        <p className="font-semibold">{user.name}</p>
        <p className="text-sm text-gray-500">{user.email}</p>
        <p className="text-xs text-zinc-500 capitalize">{user.role}</p>
      </div>
    </div>
  )
}
