import { apiGetVendedorPerfil } from "@/services/vendedorPerfil";

const run = async () => {
  const r = await apiGetVendedorPerfil(1);
  console.log("Resultado:", r);
};

run();
