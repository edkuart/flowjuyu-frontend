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

function getValue(value: any) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") return value.nombre;
  return null;
}

export default function ProductSpecs(specs: SpecsProps) {
  const entries = [
    { label: "Categoría", value: getValue(specs.categoria) || specs.categoria_custom },
    { label: "Clase", value: getValue(specs.clase) },
    { label: "Tela", value: getValue(specs.tela) || specs.tela_custom },
    { label: "Departamento", value: specs.departamento || specs.departamento_custom },
    { label: "Municipio", value: specs.municipio || specs.municipio_custom },
  ].filter((item) => !!item.value);

  if (entries.length === 0) return null;

  return (
    <div className="border rounded-lg p-4 bg-white w-full max-w-md">
      <h3 className="text-lg font-semibold mb-3">Especificaciones</h3>

      <table className="w-full text-sm">
        <tbody>
          {entries.map((item, index) => (
            <tr key={index} className="border-b last:border-none">
              <td className="py-2 font-medium w-1/3 text-neutral-600">
                {item.label}
              </td>
              <td className="py-2 text-neutral-800">
                {item.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
