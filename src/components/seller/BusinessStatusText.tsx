type Props = {
  estadoValidacion?: string
  productosActivos?: number
  stockBajo?: number
  ratingCount?: number
}

export default function BusinessStatusText({
  estadoValidacion,
  productosActivos = 0,
  stockBajo = 0,
  ratingCount = 0,
}: Props) {

  const isValidado = estadoValidacion === "aprobado" || estadoValidacion === "activo"
  const isPendiente = estadoValidacion === "pendiente"

  return (
    <div className="mt-6 space-y-2 text-sm text-muted-foreground">

      {/* Estado principal */}
      {isValidado && (
        <p>
          Tu negocio está activo y visible para los clientes.
        </p>
      )}

      {isPendiente && (
        <p>
          Tu negocio está pendiente de validación. Hasta que sea aprobado no será visible públicamente.
        </p>
      )}

      {!isValidado && !isPendiente && (
        <p>
          Tu negocio no está activo actualmente. Revisa la configuración de tu perfil.
        </p>
      )}

      {/* Estado productos */}
      {productosActivos === 0 && (
        <p>
          Aún no tienes productos publicados.
        </p>
      )}

      {stockBajo > 0 && (
        <p>
          Tienes productos con stock bajo.
        </p>
      )}

      {ratingCount === 0 && (
        <p>
          Aún no has recibido reseñas.
        </p>
      )}

    </div>
  )
}
