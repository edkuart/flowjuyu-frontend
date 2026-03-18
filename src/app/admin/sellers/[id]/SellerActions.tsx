"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SellerActions({ perfil }: any) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const handleSimpleAction = async (action: string) => {
    setLoading(true);

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/admin/sellers/${perfil.user_id}/${action}`,
      {
        method: "PATCH",
        credentials: "include",
      }
    );

    setLoading(false);
    router.refresh();
  };

  const handleActionWithComment = (action: string) => {
    setActionType(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!comment.trim()) return;

    setLoading(true);

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/admin/sellers/${perfil.user_id}/${actionType}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      }
    );

    setLoading(false);
    setShowModal(false);
    setComment("");
    router.refresh();
  };

  return (
    <>
      <div className="flex gap-3">
        {perfil.estado_validacion === "pendiente" && (
          <>
            <button
              disabled={loading}
              onClick={() => handleSimpleAction("approve")}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Aprobar
            </button>

            <button
              disabled={loading}
              onClick={() => handleActionWithComment("reject")}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Rechazar
            </button>
          </>
        )}

        {perfil.estado_validacion === "aprobado" &&
          perfil.estado_admin === "activo" && (
            <button
              disabled={loading}
              onClick={() => handleActionWithComment("suspend")}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Suspender
            </button>
          )}

        {perfil.estado_validacion === "aprobado" &&
          perfil.estado_admin === "suspendido" && (
            <button
              disabled={loading}
              onClick={() => handleSimpleAction("reactivate")}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Reactivar
            </button>
          )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 space-y-4">
            <h2 className="text-lg font-semibold">
              Agregar comentario obligatorio
            </h2>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded p-2"
              rows={4}
              placeholder="Escribe el motivo..."
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancelar
              </button>

              <button
                disabled={!comment.trim() || loading}
                onClick={confirmAction}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
