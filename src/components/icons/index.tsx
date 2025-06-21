// src/components/icons/index.tsx

import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
} from 'lucide-react'

// ✅ Cada ícono acepta props para personalización (como className)
export const IconDashboard = (props: React.SVGProps<SVGSVGElement>) => (
  <LayoutDashboard {...props} />
)

export const IconPackage = (props: React.SVGProps<SVGSVGElement>) => (
  <Package {...props} />
)

export const IconUsers = (props: React.SVGProps<SVGSVGElement>) => (
  <Users {...props} />
)

export const IconSettings = (props: React.SVGProps<SVGSVGElement>) => (
  <Settings {...props} />
)
