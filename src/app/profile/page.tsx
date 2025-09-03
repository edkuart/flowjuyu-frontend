'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useFileUpload } from '@/hooks/useFileUpload';

export default function ProfilePage(){
  const { data:session, status }=useSession();
  const [editando,setEditando]=useState(false);
  const [nombre,setNombre]=useState(''),[email,setEmail]=useState('');
  const [telefono,setTelefono]=useState(''),[direccion,setDireccion]=useState('');
  const inputFileRef=useRef<HTMLInputElement>(null);

  // ⬇️ Hook multi-archivo (usamos la key 'logo' para el avatar)
  const { files, previews, error, handleFile, clearFile } = useFileUpload();

  useEffect(()=>{ if(session?.user){
    setNombre(session.user.name||'');
    setEmail(session.user.email||'');
    setTelefono((session.user as any).telefono||'');
    setDireccion((session.user as any).direccion||'');
  }},[session]);

  if(status==='loading'||!session) return null;

  return (
    <main className="min-h-screen bg-white px-4 py-10 md:py-16">
      <section className="max-w-6xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900">Perfil</h1>
          <p className="text-muted-foreground mt-2">Gestiona tu cuenta y tus datos personales.</p>
        </div>

        <Card className="rounded-2xl shadow-sm border border-muted/40">
          <CardContent className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-28 h-28">
                <AvatarImage src={previews.logo ?? 'https://ui-avatars.com/api/?name=Usuario&background=random'} alt="Foto de perfil"/>
                <AvatarFallback>{nombre[0] ?? 'U'}</AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-lg font-semibold text-neutral-900">{nombre}</h2>
              <p className="text-sm text-muted-foreground">{email}</p>

              {editando && (
                <>
                  <input
                    id="avatar-upload" type="file"
                    accept="image/jpeg,image/png,image/webp"
                    ref={inputFileRef} hidden
                    onChange={(e)=>handleFile(e,'logo')}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="gap-2"
                      onClick={()=>inputFileRef.current?.click()}>
                      <Upload className="w-4 h-4"/> Subir nueva foto
                    </Button>
                    {files?.logo && (
                      <Button variant="ghost" size="sm" onClick={()=>clearFile('logo')}>Quitar</Button>
                    )}
                  </div>
                  {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
                </>
              )}

              <p className="mt-6 text-xs text-muted-foreground">Miembro desde el 12 de enero de 2024</p>
            </div>

            <form className="space-y-6 text-sm text-neutral-700" onSubmit={(e)=>e.preventDefault()}>
              <div className="grid grid-cols-1 gap-4">
                <div><Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={nombre} onChange={e=>setNombre(e.target.value)} disabled={!editando} className="mt-1"/>
                </div>
                <div><Label htmlFor="email">Correo</Label>
                  <div className="relative">
                    <Input id="email" value={email} onChange={e=>setEmail(e.target.value)} disabled={!editando} className="mt-1 pr-10"/>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2"><CheckCircle className="w-4 h-4 text-green-500"/></span>
                  </div>
                </div>
                <div><Label htmlFor="telefono">Teléfono</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">+502</span>
                    <Input id="telefono" value={telefono} onChange={e=>setTelefono(e.target.value.replace(/\D/g,''))} disabled={!editando} className="w-32" placeholder="Ej: 55556666"/>
                  </div>
                </div>
                <div><Label htmlFor="direccion">Dirección</Label>
                  <Input id="direccion" value={direccion} onChange={e=>setDireccion(e.target.value)} disabled={!editando} className="mt-1" placeholder="Ciudad, zona, calle."/>
                </div>
              </div>

              {editando ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Button type="submit" className="w-full">Guardar cambios</Button>
                  <Button type="button" variant="outline" className="w-full" onClick={()=>setEditando(false)}>Cancelar edición</Button>
                </div>
              ) : (
                <Button className="w-full mt-4" type="button" onClick={()=>setEditando(true)}>Editar datos</Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Separator className="my-6"/>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/profile/direcciones"><Card className="hover:shadow-md transition"><CardContent className="p-6"><h3 className="text-lg font-semibold">Direcciones</h3><p className="text-sm text-muted-foreground mt-1">Administra tus direcciones de envío.</p></CardContent></Card></Link>
          <Link href="/profile/historial"><Card className="hover:shadow-md transition"><CardContent className="p-6"><h3 className="text-lg font-semibold">Historial</h3><p className="text-sm text-muted-foreground mt-1">Consulta tus pedidos anteriores.</p></CardContent></Card></Link>
          <Link href="/profile/favoritos"><Card className="hover:shadow-md transition"><CardContent className="p-6"><h3 className="text-lg font-semibold">Favoritos</h3><p className="text-sm text-muted-foreground mt-1">Accede a tu lista de deseos.</p></CardContent></Card></Link>
        </div>
      </section>
    </main>
  );
}
