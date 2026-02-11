"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

type Categoria = {
  id: number;
  nombre: string;
  slug: string;
};

export default function CategoriesDropdown() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/public/categories`)
      .then(res => {
        if (!res.ok) throw new Error("Error cargando categorías");
        return res.json();
      })
      .then(data => setCategorias(data))
      .catch(console.error);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="font-medium hover:text-primary">
        Categorías
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
          <ul className="py-2">
            {categorias.map(cat => (
              <li key={cat.id}>
                <Link
                  href={`/categorias/${cat.slug}`}
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  {cat.nombre}
                </Link>
              </li>
            ))}

            <li className="border-t mt-2">
              <Link
                href="/categorias"
                className="block px-4 py-2 font-semibold hover:bg-gray-100"
              >
                Ver todas →
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
