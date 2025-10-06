// src/services/archivos.ts

import axios from "axios"

export async function apiEliminarArchivoAnterior(campo: string, id: string) {
  const response = await axios.delete(`/api/archivos/${campo}?id=${id}`)
  return response.data
}
