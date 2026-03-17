import { Tag, Layers, Scissors, MapPin, Building2 } from "lucide-react";

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
};

function getValue(value: any): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "nombre" in value) return value.nombre;
  return null;
}

export default function ProductSpecs(specs: SpecsProps) {
  const entries = [
    {
      label: "Categoría",
      value: getValue(specs.categoria) || specs.categoria_custom,
      Icon: Tag,
    },
    {
      label: "Clase",
      value: getValue(specs.clase),
      Icon: Layers,
    },
    {
      label: "Material / Tela",
      value: getValue(specs.tela) || specs.tela_custom,
      Icon: Scissors,
    },
    {
      label: "Departamento",
      value: specs.departamento || specs.departamento_custom,
      Icon: MapPin,
    },
    {
      label: "Municipio",
      value: specs.municipio || specs.municipio_custom,
      Icon: Building2,
    },
  ].filter((item) => !!item.value);

  if (entries.length === 0) return null;

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-4">

      <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-widest">
        Detalles del producto
      </h3>

      <div className="divide-y divide-neutral-50">
        {entries.map(({ label, value, Icon }) => (
          <div key={label} className="flex items-center gap-3 py-2.5">
            <span className="flex-shrink-0 w-6 flex justify-center">
              <Icon className="w-4 h-4 text-neutral-400" />
            </span>
            <span className="text-xs font-semibold text-neutral-400 w-28 flex-shrink-0">
              {label}
            </span>
            <span className="text-sm text-neutral-800 font-medium">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
