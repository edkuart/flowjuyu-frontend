export default function NewArrivalsPage() {
  const items = [
    { id: 1, name: "Huipil bordado San Juan", price: 680, img: "/images/productos/producto1.jpg" },
    { id: 2, name: "Cartera tejida a mano", price: 320, img: "/images/productos/producto2.jpg" },
    { id: 3, name: "Faja multicolor tradicional", price: 160, img: "/images/productos/producto3.jpg" },
    { id: 4, name: "Poncho de lana artesanal", price: 540, img: "/images/productos/producto4.jpg" },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Novedades</h1>
        <p className="text-muted-foreground">
          Las piezas más recientes creadas por artesanos. Descubre lo que acaba de llegar a Flowjuyu.
        </p>
      </header>

      {/* filtros / ordenamiento */}
      <section className="flex flex-wrap items-center gap-3">
        <input
          placeholder="Buscar novedades"
          className="h-10 rounded-md border px-3 text-sm w-full sm:w-72"
        />
        <select className="h-10 rounded-md border px-3 text-sm">
          <option value="latest">Ordenar por: Más recientes</option>
          <option value="priceAsc">Precio: de menor a mayor</option>
          <option value="priceDesc">Precio: de mayor a menor</option>
          <option value="name">Nombre</option>
        </select>
        <select className="h-10 rounded-md border px-3 text-sm">
          <option>Todas las categorías</option>
          <option>Huipiles</option>
          <option>Blusas</option>
          <option>Fajas</option>
          <option>Accesorios</option>
        </select>
      </section>

      {/* grid */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <article key={p.id} className="rounded-xl border overflow-hidden bg-white">
            <div className="aspect-square bg-gray-100">
              {/* reemplaza por <Image /> si ya tienes las imágenes */}
              <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 space-y-1">
              <h3 className="font-semibold line-clamp-2">{p.name}</h3>
              <p className="text-sm text-muted-foreground">Colección artesanal</p>
              <div className="pt-1 font-bold">Q {p.price.toFixed(2)}</div>
              <button className="mt-2 w-full h-9 rounded-md border hover:bg-gray-50 text-sm">
                Ver detalles
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* bloque de info */}
      <section className="rounded-xl border p-6 bg-white">
        <h2 className="text-xl font-semibold mb-2">Cómo seleccionamos las novedades</h2>
        <p className="text-sm text-muted-foreground">
          Trabajamos de cerca con artesanos aliados para publicar piezas frescas y auténticas cada semana.
          Cada producto pasa por una revisión básica de calidad e incluye información de procedencia cuando es posible.
        </p>
      </section>
    </main>
  );
}
