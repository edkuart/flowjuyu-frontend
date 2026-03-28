import { Tag, Layers, Scissors, MapPin, Building2, Gem, Package } from "lucide-react";

type SpecsProps = {
  categoria?: any;
  clase?: any;
  tela?: any;
  departamento?: string | null;
  municipio?: string | null;
  categoria_custom?: string | null;
  tela_custom?: string | null;
  departamento_custom?: string | null;
  municipio_custom?: string | null;
  accesorio?: any;
  accesorio_tipo?: string | null;
  accesorio_material?: string | null;
};

type Entry = { label: string; value: string; Icon: React.ElementType };
type Group = { heading: string; entries: Entry[] };

function getValue(value: any): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "nombre" in value) return value.nombre;
  return null;
}

function entry(label: string, value: string | null | undefined, Icon: React.ElementType): Entry | null {
  if (!value) return null;
  return { label, value, Icon };
}

function group(heading: string, rows: (Entry | null)[]): Group | null {
  const entries = rows.filter(Boolean) as Entry[];
  if (entries.length === 0) return null;
  return { heading, entries };
}

export default function ProductSpecs(specs: SpecsProps) {
  const categoriaName = getValue(specs.categoria) || specs.categoria_custom;
  const isAccesorio   = !!getValue(specs.accesorio) || !!specs.accesorio_tipo || !!specs.accesorio_material;

  const groups: Group[] = isAccesorio
    ? // ── ACCESORIO ─────────────────────────────────────────
      [
        group("Categoría", [
          entry("Categoría", categoriaName, Tag),
        ]),
        group("Características", [
          entry("Tipo",     specs.accesorio_tipo,     Gem),
          entry("Material", specs.accesorio_material, Package),
        ]),
        group("Origen", [
          entry("Departamento", specs.departamento || specs.departamento_custom, MapPin),
          entry("Municipio",    specs.municipio    || specs.municipio_custom,    Building2),
        ]),
      ].filter(Boolean) as Group[]
    : // ── TEXTIL / default ──────────────────────────────────
      [
        group("Categoría", [
          entry("Categoría", categoriaName, Tag),
        ]),
        group("Características", [
          entry("Clase",          getValue(specs.clase),                      Layers),
          entry("Tela / Material", getValue(specs.tela) || specs.tela_custom, Scissors),
        ]),
        group("Origen", [
          entry("Departamento", specs.departamento || specs.departamento_custom, MapPin),
          entry("Municipio",    specs.municipio    || specs.municipio_custom,    Building2),
        ]),
      ].filter(Boolean) as Group[];

  if (groups.length === 0) return null;

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
      {/* Title */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
          Información del producto
        </h3>
      </div>

      {/* Groups */}
      <div className="divide-y divide-neutral-50">
        {groups.map(({ heading, entries }) => (
          <div key={heading} className="px-5 py-4 space-y-3">
            {/* Group heading */}
            <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
              {heading}
            </p>

            {/* Rows */}
            <div className="space-y-2.5">
              {entries.map(({ label, value, Icon }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="w-3.5 h-3.5 text-neutral-300 mt-0.5 flex-shrink-0" />
                  <span className="text-[11px] text-neutral-400 w-24 flex-shrink-0 pt-px">
                    {label}
                  </span>
                  <span className="text-sm text-neutral-800 font-medium leading-snug">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
