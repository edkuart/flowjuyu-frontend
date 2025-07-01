// src/services/auth.ts
import { RegisterCompradorValues } from '@/schemas/register-comprador.schema'

export async function apiRegisterComprador(data: RegisterCompradorValues) {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, rol: 'comprador' }),
    })

    if (!res.ok) {
      const err = await res.json()
      return { ok: false, message: err.message || 'Error al registrar' }
    }

    return { ok: true }
  } catch (error) {
    return { ok: false, message: 'Ocurrió un error inesperado' }
  }
}
