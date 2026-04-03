"use client";

import { Tag, Layers, Scissors, MapPin, Building2, Gem, Package } from "lucide-react";
import { useLanguage } from "@/i18n/context/useLanguage";
import { createT } from "@/i18n/utils/t";
import esDictionary from "@/i18n/dictionaries/es";

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
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  const categoriaName = getValue(specs.categoria) || specs.categoria_custom;
  const isAccesorio   = !!getValue(specs.accesorio) || !!specs.accesorio_tipo || !!specs.accesorio_material;

  const groups: Group[] = isAccesorio
    ? [
        group(tr("pdp.specCategory"), [
          entry(tr("pdp.specCategory"), categoriaName, Tag),
        ]),
        group(tr("pdp.specCharacteristics"), [
          entry(tr("pdp.specType"),     specs.accesorio_tipo,     Gem),
          entry(tr("pdp.specMaterial"), specs.accesorio_material, Package),
        ]),
        group(tr("pdp.specOrigin"), [
          entry(tr("pdp.specDepartment"), specs.departamento || specs.departamento_custom, MapPin),
          entry(tr("pdp.specMunicipality"), specs.municipio  || specs.municipio_custom,    Building2),
        ]),
      ].filter(Boolean) as Group[]
    : [
        group(tr("pdp.specCategory"), [
          entry(tr("pdp.specCategory"), categoriaName, Tag),
        ]),
        group(tr("pdp.specCharacteristics"), [
          entry(tr("pdp.specClass"),          getValue(specs.clase),                      Layers),
          entry(tr("pdp.specFabric"), getValue(specs.tela) || specs.tela_custom, Scissors),
        ]),
        group(tr("pdp.specOrigin"), [
          entry(tr("pdp.specDepartment"), specs.departamento || specs.departamento_custom, MapPin),
          entry(tr("pdp.specMunicipality"), specs.municipio  || specs.municipio_custom,    Building2),
        ]),
      ].filter(Boolean) as Group[];

  if (groups.length === 0) return null;

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100">
        <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
          {tr("pdp.productInfo")}
        </h3>
      </div>

      <div className="divide-y divide-neutral-50">
        {groups.map(({ heading, entries }) => (
          <div key={heading} className="px-5 py-4 space-y-3">
            <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
              {heading}
            </p>
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
