//src/lib/constants/estadoDocumentos.ts
export type EstadoDocumento = 'Validado' | 'En revisión' | 'Rechazado' | 'Pendiente'

export const ESTADO_COLORES: Record<EstadoDocumento, string> = {
  'Validado': 'bg-green-100 text-green-700',
  'En revisión': 'bg-yellow-100 text-yellow-800',
  'Rechazado': 'bg-red-100 text-red-700',
  'Pendiente': 'bg-gray-100 text-gray-800',
}
