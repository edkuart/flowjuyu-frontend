"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

type Categoria = {
  id: number;
  nombre: string;
  slug: string;
};

// ── Module-level cache ────────────────────────────────────────────────────────
// Shared across all mounted instances of this component. The fetch fires once
// per page session regardless of how many times the component mounts/unmounts.
let _cache: Categoria[] | null = null;
let _inflight: Promise<Categoria[]> | null = null;

async function fetchCategories(): Promise<Categoria[]> {
  if (_cache) return _cache;
  if (_inflight) return _inflight;

  _inflight = fetch(`${API}/api/public/categories`)
    .then(res => {
      if (!res.ok) throw new Error(`categories ${res.status}`);
      return res.json() as Promise<Categoria[]>;
    })
    .then(data => {
      _cache = data;
      _inflight = null;
      return data;
    })
    .catch(err => {
      _inflight = null; // allow retry on next mount
      throw err;
    });

  return _inflight;
}

export default function CategoriesDropdown() {
  const [categorias, setCategorias] = useState<Categoria[]>(_cache ?? []);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (_cache) return; // already loaded — nothing to do
    fetchCategories()
      .then(setCategorias)
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
