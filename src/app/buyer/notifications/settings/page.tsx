"use client";

import { Switch } from "@/components/ui/switch";

export default function NotificationSettings() {

  const settings = [
    {
      title: "Pedidos",
      items: [
        { label: "Estado de mis pedidos", push: true, email: false },
        { label: "Solicitudes de garantía", push: true, email: true },
        { label: "Reembolsos y devoluciones", push: true, email: true },
      ],
    },
    {
      title: "Actividad",
      items: [
        { label: "Respuestas a mis preguntas", push: true, email: true },
        { label: "Cambios en mis favoritos", push: true, email: false },
      ],
    },
    {
      title: "Ofertas y promociones",
      items: [
        { label: "Promociones y descuentos", push: true, email: true },
        { label: "Productos en stock nuevamente", push: true, email: false },
      ],
    },
  ];

  return (
    <div className="space-y-10 max-w-3xl">

      <h1 className="text-2xl font-bold">Configurar notificaciones</h1>

      {settings.map((group, idx) => (
        <div key={idx} className="space-y-4">
          
          <h2 className="text-lg font-semibold">{group.title}</h2>

          <div className="divide-y rounded-xl border bg-white">
            {group.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="font-medium">{item.label}</p>
                </div>

                <div className="flex gap-6 items-center">

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-600">Push</span>
                    <Switch defaultChecked={item.push} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-600">Email</span>
                    <Switch defaultChecked={item.email} />
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      ))}

    </div>
  );
}
