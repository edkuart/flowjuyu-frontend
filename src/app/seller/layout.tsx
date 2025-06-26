import Link from 'next/link'
import { ReactNode } from 'react'
import { Home, Package, ShoppingCart, User } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: Home, href: '/seller/dashboard' },
  { label: 'Productos', icon: Package, href: '/seller/products' },
  { label: 'Pedidos', icon: ShoppingCart, href: '/seller/orders' },
  { label: 'Perfil público', icon: User, href: '/seller/profile' },
  { label: 'Mi negocio', icon: User, href: '/seller/profile/business' },
  { label: 'Validación', icon: User, href: '/seller/profile/validation' },
]

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-muted/20">
      <aside className="w-64 bg-white border-r shadow-sm hidden md:block">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Panel Vendedor</h2>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map(({ label, icon: Icon, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition px-3 py-2 rounded-md hover:bg-muted"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
