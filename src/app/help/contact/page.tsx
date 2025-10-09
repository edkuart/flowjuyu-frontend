export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Contáctanos</h1>
        <p className="text-muted-foreground mt-1">Estamos aquí para ayudarte.</p>
      </header>

      <form className="space-y-4 bg-white border p-6 rounded-lg">
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input type="text" className="w-full border rounded px-3 py-2 mt-1" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Correo electrónico</label>
          <input type="email" className="w-full border rounded px-3 py-2 mt-1" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Mensaje</label>
          <textarea className="w-full border rounded px-3 py-2 mt-1" rows={5} required />
        </div>
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-md hover:opacity-90">
          Enviar mensaje
        </button>
      </form>

      <section className="rounded-xl border p-6 bg-white">
        <h2 className="text-xl font-semibold mb-2">Otras formas de contacto</h2>
        <p className="text-sm text-muted-foreground">📧 soporte@flowjuyu.com</p>
        <p className="text-sm text-muted-foreground">📞 +502 1234-5678</p>
      </section>
    </main>
  );
}
