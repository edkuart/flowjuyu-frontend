export function SellerStatusCard({ perfil }: any) {
  const kycColor =
    perfil.estado_validacion === "aprobado"
      ? "bg-green-100 text-green-700"
      : perfil.estado_validacion === "rechazado"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  const adminColor =
    perfil.estado_admin === "activo"
      ? "bg-green-100 text-green-700"
      : perfil.estado_admin === "suspendido"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";

  return (
    <div className="border rounded-xl p-4 space-y-2">
      <div>
        <span className="font-medium">KYC:</span>{" "}
        <span className={`px-2 py-1 rounded ${kycColor}`}>
          {perfil.estado_validacion}
        </span>
      </div>

      <div>
        <span className="font-medium">Operativo:</span>{" "}
        <span className={`px-2 py-1 rounded ${adminColor}`}>
          {perfil.estado_admin}
        </span>
      </div>

      {perfil.observaciones && (
        <div className="text-sm text-red-600 mt-2">
          Motivo: {perfil.observaciones}
        </div>
      )}
    </div>
  );
}
