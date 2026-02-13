export default function ReturnsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Devoluciones</h1>
        <p className="text-muted-foreground mt-1">
          Conoce cómo gestionar devoluciones de forma fácil y rápida.
        </p>
      </header>

      <section className="rounded-xl border p-6 bg-white space-y-3">
        <h2 className="text-xl font-semibold">Política de devoluciones</h2>
        <p className="text-sm text-muted-foreground">
          Puedes devolver productos dentro de los primeros 15 días posteriores a la entrega,
          siempre que estén en condiciones originales.
        </p>
      </section>

      <section className="rounded-xl border p-6 bg-white space-y-3">
        <h2 className="text-xl font-semibold">Cómo iniciar una devolución</h2>
        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
          <li>Ve a tu perfil y selecciona el pedido.</li>
          <li>Haz clic en “Solicitar devolución”.</li>
          <li>Empaca el producto en su empaque original.</li>
          <li>Entrega a la empresa de envíos designada.</li>
        </ol>
      </section>
    </main>
  );
}
