import { CommunicationPreferencesPanel } from "@/components/settings/CommunicationPreferencesPanel";

export default function NotificationSettings() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-neutral-900">
          Configurar comunicaciones
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-neutral-500">
          Administra solo mensajes promocionales. Los correos operativos de
          cuenta, pedidos y seguridad siguen activos para mantener tu acceso y
          tu historial al día.
        </p>
      </div>

      <CommunicationPreferencesPanel surface="buyer_notifications_settings" />
    </div>
  );
}
