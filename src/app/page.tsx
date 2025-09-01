import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="space-y-12 pb-10">
      {/* Hero Banner Cultural */}
      <section className="relative h-[80vh] w-full">
        <Image
          src="/images/hero-cultural.jpg"
          alt="Hero cultural"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Compra directo a artesanos guatemaltecos
          </h1>
          <p className="text-lg md:text-xl mb-4">
            Explora cultura, identidad y talento
          </p>
          <Link href="/categorias">
            <button className="bg-white text-black px-6 py-2 rounded-xl font-semibold hover:bg-gray-100">
              Ver productos
            </button>
          </Link>
        </div>
      </section>

      {/* Categorías Destacadas */}
      <section className="px-4 md:px-12">
        <h2 className="text-2xl font-semibold mb-6">Categorías</h2>
        <div className="overflow-x-auto whitespace-nowrap flex gap-4">
          {[
            'Huipiles',
            'Blusas',
            'Fajas',
            'Accesorios',
            'Pantalones',
            'Carteras',
            'Ponchos',
          ].map((cat) => (
            <Link
              href={`/categorias/${cat.toLowerCase()}`}
              key={cat}
              className="flex-shrink-0 w-48"
            >
              <div className="border rounded-xl overflow-hidden hover:shadow-lg cursor-pointer">
                <Image
                  src={`/images/categorias/${cat.toLowerCase()}.jpg`}
                  alt={cat}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover"
                />
                <p className="text-center font-medium py-2">{cat}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Productos Nuevos */}
      <section className="px-4 md:px-12">
        <h2 className="text-2xl font-semibold mb-6">Nuevos productos</h2>
        <div className="overflow-x-auto whitespace-nowrap flex gap-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex-shrink-0 w-60 border rounded-xl overflow-hidden hover:shadow-md"
            >
              <Image
                src={`/images/productos/producto${item}.jpg`}
                alt={`Producto ${item}`}
                width={240}
                height={240}
                className="w-full h-40 object-cover"
              />
              <div className="p-2">
                <h3 className="font-medium">Producto #{item}</h3>
                <p className="text-sm text-gray-500">Q{item * 100}.00</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tiendas Destacadas */}
      <section className="px-4 md:px-12">
        <h2 className="text-2xl font-semibold mb-6">Tiendas destacadas</h2>
        <div className="overflow-x-auto whitespace-nowrap flex gap-4">
          {['Tienda Maya', 'Artesanías Luz', 'Textiles Xela'].map(
            (store, index) => (
              <div
                key={store}
                className="flex-shrink-0 w-64 border rounded-xl p-4 bg-white hover:shadow"
              >
                <Image
                  src={`/images/tiendas/logo${index + 1}.jpg`}
                  alt={`Logo de ${store}`}
                  width={64}
                  height={64}
                  className="rounded-full mb-2"
                />
                <h3 className="font-semibold text-lg">{store}</h3>
                <p className="text-sm text-gray-500">Artesanía de alta calidad</p>
                <Link
                  href={`/tienda/${store.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <button className="mt-2 text-sm text-primary underline">
                    Visitar tienda
                  </button>
                </Link>
              </div>
            ),
          )}
        </div>
      </section>

      {/* CTA para Vendedores */}
      <section className="bg-primary text-white text-center py-10 px-6 rounded-xl mx-4 md:mx-12">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          ¿Tienes un negocio de ropa típica?
        </h3>
        <p className="mb-6">
          Vende en Flowjuyu y conecta con compradores culturales
        </p>
        <Link href="/registro?vendedor=1">
          <button className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-100">
            Crear tienda
          </button>
        </Link>
      </section>
    </main>
  )
}
