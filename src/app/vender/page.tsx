import Link from "next/link";

export default function VenderPage() {
  return (
    <main className="bg-[#f6f2ea] min-h-screen py-24">

      <div className="max-w-4xl mx-auto px-6 text-center space-y-10">

        <h1 className="font-serif text-4xl md:text-5xl text-neutral-900">
          Vende en Flowjuyu
        </h1>

        <p className="text-neutral-600 max-w-xl mx-auto">
          Flowjuyu conecta artesanos guatemaltecos con compradores
          que buscan textiles auténticos. Crea tu tienda y comienza
          a compartir tu trabajo con el mundo.
        </p>

        <Link
          href="/register/seller"
          className="inline-block bg-[#0d2d20] text-white px-10 py-4 uppercase tracking-[0.25em] text-xs rounded-sm hover:bg-[#163a2b] transition"
        >
          Crear mi tienda
        </Link>

      </div>

    </main>
  );
}