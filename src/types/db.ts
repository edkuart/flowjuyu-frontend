// ============================================================
// Tipos base alineados a los modelos Sequelize del backend
// ============================================================

export type RolUsuario = "comprador" | "vendedor" | "admin";
export type EstadoVendedor = "pendiente" | "aprobado" | "rechazado";

// ----------------------------------------------------------------
// Tabla: users
// ----------------------------------------------------------------
export interface User {
  id: number;
  nombre: string;
  correo: string;           // siempre en minúsculas
  password?: string;        // no se usa en frontend salvo registro
  telefono?: string | null;
  direccion?: string | null;
  rol: RolUsuario;
  createdAt?: string;       // ISO Date desde backend
  updatedAt?: string;
  // Relación 1:1 con vendedor_perfil (si aplica)
  perfil?: VendedorPerfil;
}

// ----------------------------------------------------------------
// Tabla: vendedor_perfil
// ----------------------------------------------------------------
export interface VendedorPerfil {
  id: number;
  user_id: number;          // FK -> users.id
  nombre: string;
  correo: string;           // mismo valor que en users
  telefono?: string | null;
  direccion?: string | null;
  imagen_url?: string | null;
  nombre_comercio: string;
  telefono_comercio?: string | null;
  departamento?: string | null;
  municipio?: string | null;
  descripcion?: string | null;
  dpi: string;
  foto_dpi_frente?: string | null;
  foto_dpi_reverso?: string | null;
  selfie_con_dpi?: string | null;
  estado: EstadoVendedor;   // default 'pendiente'
  createdAt?: string;
  updatedAt?: string;
  // Relación inversa
  user?: User;
}

// ----------------------------------------------------------------
// Interfaces auxiliares (para formularios o creación)
// ----------------------------------------------------------------
export type UserRegisterInput = Omit<User, "id" | "createdAt" | "updatedAt" | "perfil"> & {
  password: string;
};

export type VendedorPerfilInput = Omit<VendedorPerfil, "id" | "createdAt" | "updatedAt" | "user">;
