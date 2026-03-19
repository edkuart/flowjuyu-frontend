// tests/zod-test.ts
import { userSchema } from "@/schemas/user-schema";
import { vendedorPerfilSchema } from "@/schemas/vendedor-perfil-schema";

console.log("==============================================");
console.log("🔍 Iniciando pruebas Zod (user + vendedor)...");
console.log("==============================================");

// -----------------------------------------------------
// ✅ Prueba 1: Usuario válido
// -----------------------------------------------------
try {
  const user = userSchema.parse({
    nombre: "Edwart",
    correo: "EDWART@demo.com",
    password: "MiClave123",
    confirmarPassword: "MiClave123",
    telefono: "55443322",
    direccion: "Zona 1",
  });
  console.log("✔️ Usuario válido:", user);
} catch (err: any) {
  console.error("❌ Error usuario:", err.errors ?? err);
}

// -----------------------------------------------------
// ❌ Prueba 2: Usuario con error (correo inválido)
// -----------------------------------------------------
try {
  userSchema.parse({
    nombre: "Test Error",
    correo: "correo_sin_arroba",
    password: "123",
    confirmarPassword: "123",
  });
} catch (err: any) {
  console.error("🚫 Usuario inválido detectado:", err.errors ?? err);
}

// -----------------------------------------------------
// ✅ Prueba 3: Perfil vendedor válido
// -----------------------------------------------------
try {
  const perfil = vendedorPerfilSchema.parse({
    user_id: 1,
    nombre: "Vendedor Demo",
    correo: "Vendedor@demo.com",
    telefono: "12345678",
    direccion: "Salcajá, Quetzaltenango",
    nombre_comercio: "Tienda Demo",
    telefono_comercio: "87654321",
    departamento: "Quetzaltenango",
    municipio: "Salcajá",
    descripcion: "Venta de cortes típicos y tejidos guatemaltecos.",
    dpi: "1234567890123",
  });
  console.log("✔️ Perfil vendedor válido:", perfil);
} catch (err: any) {
  console.error("❌ Error perfil:", err.errors ?? err);
}

// -----------------------------------------------------
// ❌ Prueba 4: DPI inválido
// -----------------------------------------------------
try {
  vendedorPerfilSchema.parse({
    user_id: 1,
    nombre: "Vendedor X",
    correo: "vendedor@demo.com",
    telefono: "1234",
    direccion: "Xela",
    nombre_comercio: "Tienda X",
    telefono_comercio: "12345678",
    departamento: "Quetzaltenango",
    municipio: "Xela",
    descripcion: "Venta local",
    dpi: "999", // <-- DPI inválido
  });
} catch (err: any) {
  console.error("🚫 Perfil vendedor inválido detectado:", err.errors ?? err);
}

console.log("==============================================");
console.log("🏁 Fin de las pruebas Zod");
console.log("==============================================");
