// src/services/perfil.ts
import axios from "axios"

export async function apiActualizarPerfilCliente(data: FormData): Promise<boolean> {
  try {
    const res = await axios.post("/api/perfil/actualizar", data)
    return res.status === 200
  } catch (err) {
    console.error("Error al actualizar perfil del cliente:", err)
    return false
  }
}
