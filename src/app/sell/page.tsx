export default function SellPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-10 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Vende en Flowjuyu</h1>
        <p className="text-muted-foreground">
          Abre tu tienda y llega a clientes que valoran la cultura, la calidad y el comercio justo.
        </p>
      </header>

      {/* beneficios */}
      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            t: "Sin complicaciones técnicas",
            d: "Nos encargamos del hosting, los pagos y la logística básica para que te concentres en tu arte."
          },
          {
            t: "Comisiones justas",
            d: "Tarifas transparentes y pagos a tu cuenta local o método preferido."
          },
          {
            t: "Haz crecer tu marca",
            d: "Analíticas, personalización de tu tienda y herramientas de promoción."
          }
        ].map((b, i) => (
          <div key={i} className="rounded-xl border p-5 bg-white">
            <h3 className="font-semibold mb-1">{b.t}</h3>
            <p className="text-sm text-muted-foreground">{b.d}</p>
          </div>
        ))}
      </section>

      {/* cómo funciona */}
      <section className="rounded-xl border p-6 bg-white">
        <h2 className="text-xl font-semibold mb-3">Cómo funciona</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          <li className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground mb-1">Paso 1</div>
            <div className="font-semibold">Crea tu cuenta de vendedor</div>
            <p className="text-sm text-muted-foreground mt-1">
              Verifica tu identidad y configura tu método de pago.
            </p>
          </li>
          <li className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground mb-1">Paso 2</div>
            <div className="font-semibold">Publica tus productos</div>
            <p className="text-sm text-muted-foreground mt-1">
              Sube fotos, define precios, stock y opciones de entrega.
            </p>
          </li>
          <li className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground mb-1">Paso 3</div>
            <div className="font-semibold">Comienza a vender</div>
            <p className="text-sm text-muted-foreground mt-1">
              Recibe pedidos, gestiona envíos y sigue tu rendimiento.
            </p>
          </li>
        </ol>
      </section>

      {/* preguntas frecuentes */}
      <section className="rounded-xl border p-6 bg-white">
        <h2 className="text-xl font-semibold mb-3">Preguntas frecuentes para vendedores</h2>
        <div className="space-y-4">
          <details className="rounded-md border p-4">
            <summary className="font-medium cursor-pointer">¿Cuáles son las comisiones?</summary>
            <p className="mt-2 text-sm text-muted-foreground">
              Las comisiones varían según el método de pago. Generalmente van del 10% al 15% por pedido.
            </p>
          </details>
          <details className="rounded-md border p-4">
            <summary className="font-medium cursor-pointer">¿Cuándo recibo mi pago?</summary>
            <p className="mt-2 text-sm text-muted-foreground">
              Los pagos se procesan semanalmente una vez entregados los pedidos (o según la configuración elegida).
            </p>
          </details>
        </div>
      </section>

      {/* acciones */}
      <div className="flex flex-wrap gap-3">
        <a href="/register/seller" className="h-10 px-4 rounded-md border inline-flex items-center justify-center hover:bg-gray-50">
          Crear mi tienda
        </a>
        <a href="/help/contact" className="h-10 px-4 rounded-md border inline-flex items-center justify-center hover:bg-gray-50">
          Habla Nosotros
        </a>
      </div>
    </main>
  );
}
