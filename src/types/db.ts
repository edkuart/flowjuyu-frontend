// ============================================================
// Tipos base alineados a los modelos Sequelize del backend
// ============================================================

export type RolUsuario = "comprador" | "vendedor" | "admin";
export type EstadoVendedor   = "pendiente" | "aprobado" | "rechazado";
export type EstadoAdmin      = "activo"    | "inactivo" | "suspendido";

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
  user_id: number;
  nombre: string;
  correo: string;
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

  // 🔒 Alineado al backend real
  observaciones?:    string | null;
  estado_validacion?: EstadoVendedor | null;
  estado_admin?:      EstadoAdmin    | null;
  banner_url?:        string | null;

  createdAt?: string;
  updatedAt?: string;
  user?: User;
}

// ----------------------------------------------------------------
// Interfaces auxiliares (para formularios o creación)
// ----------------------------------------------------------------
export type UserRegisterInput = Omit<User, "id" | "createdAt" | "updatedAt" | "perfil"> & {
  password: string;
};

export type VendedorPerfilInput = Omit<VendedorPerfil, "id" | "createdAt" | "updatedAt" | "user">;
