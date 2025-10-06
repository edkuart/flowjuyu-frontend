import { apiGetVendedorPerfil } from "@/services/vendedorPerfil";

async function main() {
  console.log("======================================");
  console.log("🔍 Probando apiGetVendedorPerfil(1)...");
  console.log("======================================");

  const result = await apiGetVendedorPerfil(1);
  console.log("Resultado:", result);

  console.log("======================================");
  console.log("🏁 Fin de prueba de servicio vendedor");
  console.log("======================================");
}

main().catch((err) => {
  console.error("❌ Error ejecutando test:", err);
});
