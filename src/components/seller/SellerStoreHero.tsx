'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Eye, Pencil, Star, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useLanguage } from '@/i18n/context/useLanguage'
import { createT } from '@/i18n/utils/t'
import esDictionary from '@/i18n/dictionaries/es'

type Props = {
  nombreComercio: string
  descripcion?: string
  logo?: string | null
  departamento?: string
  municipio?: string
  ratingAvg?: number
  ratingCount?: number
  viewAsClientUrl?: string
  editProfileUrl?: string
}

export default function SellerStoreHero({
  nombreComercio,
  descripcion,
  logo,
  departamento,
  municipio,
  ratingAvg = 0,
  ratingCount = 0,
  viewAsClientUrl = '#',
  editProfileUrl = '/seller/profile',
}: Props) {
  const { dictionary } = useLanguage()
  const tr = createT(dictionary ?? esDictionary)

  return (
    <section className="bg-[#f8f5ef] border-b">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6 items-start md:items-center">

        {/* LOGO */}
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-muted border shrink-0">
          {logo ? (
            <Image
              src={logo}
              alt={nombreComercio}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
              {tr("seller.noLogo")}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900">
            {nombreComercio}
          </h1>

          {(municipio || departamento) && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {municipio}
              {municipio && departamento ? ', ' : ''}
              {departamento}
            </p>
          )}

          {descripcion && (
            <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed">
              {descripcion}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2 text-sm pt-1">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="font-medium">
              {ratingAvg ? ratingAvg.toFixed(1) : '—'}
            </span>
            <span className="text-muted-foreground">
              ({ratingCount} {ratingCount === 1 ? tr("seller.reviewSingular") : tr("seller.reviewPlural")})
            </span>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex gap-2">
          <Link href={editProfileUrl}>
            <Button variant="outline" className="gap-2">
              <Pencil className="w-4 h-4" />
              {tr("seller.editProfile")}
            </Button>
          </Link>

          <Link href={viewAsClientUrl}>
            <Button className="gap-2">
              <Eye className="w-4 h-4" />
              {tr("seller.viewAsClient")}
            </Button>
          </Link>
        </div>

      </div>
    </section>
  )
}
