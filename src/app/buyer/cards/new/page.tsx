"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, ArrowLeft, ShieldCheck, Save, Loader2 } from "lucide-react";

export default function NewCardPage() {
  const router = useRouter();
  
  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim()
      .slice(0, 19);
  };

  const formatExp = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d{1,2})/, "$1/$2")
      .slice(0, 5);
  };

  const submitCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulación de carga para conectar con backend/Stripe
    setTimeout(() => {
      alert("Tarjeta guardada (conectar backend)");
      setIsSaving(false);
      router.push("/buyer/cards");
    }, 1500);
  };

  // ESTILO COMPARTIDO PARA LOS INPUTS
  const inputClassName = "rounded-xl border-gray-200 focus-visible:ring-orange-500 mt-1.5 font-medium";

  return (
    <div className="max-w-xl space-y-6 animate-in fade-in duration-300">

      {/* HEADER Y BOTÓN DE REGRESAR */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push("/buyer/cards")}
          className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-orange-500" />
            Agregar tarjeta
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ingresa los datos para guardarla de forma segura.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
        
        {/* TARJETA VISUAL */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 text-white p-6 shadow-xl mb-8 transform transition-all duration-300 hover:scale-[1.02]">
          
          {/* Círculos decorativos de fondo */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex justify-between text-sm opacity-90 items-center">
            <span className="font-semibold tracking-wider">FLOWJUYU PAY</span>
            <CreditCard className="w-6 h-6 text-orange-400" />
          </div>

          <div className="relative z-10 mt-8 mb-4 text-2xl tracking-widest font-mono text-gray-100 drop-shadow-md">
            {cardNumber || "•••• •••• •••• ••••"}
          </div>

          <div className="relative z-10 flex justify-between text-sm opacity-90">
            <div>
              <p className="uppercase text-[10px] text-gray-400 tracking-widest mb-1">Titular de la tarjeta</p>
              <p className="font-medium tracking-wide uppercase truncate max-w-[200px]">
                {name || "NOMBRE COMPLETO"}
              </p>
            </div>

            <div className="text-right">
              <p className="uppercase text-[10px] text-gray-400 tracking-widest mb-1">Vence</p>
              <p className="font-mono tracking-wide">{exp || "MM/AA"}</p>
            </div>
          </div>
        </div>

        {/* NOTA DE SEGURIDAD */}
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-6">
          <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
          <p>Tus datos se encriptan con seguridad de nivel bancario (AES-256).</p>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={submitCard} className="space-y-5">

          {/* Numero de tarjeta */}
          <div>
            <label className="text-sm font-medium text-gray-700">Número de tarjeta</label>
            <Input
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
              className={`${inputClassName} font-mono text-lg`}
            />
          </div>

          {/* Nombre del titular */}
          <div>
            <label className="text-sm font-medium text-gray-700">Nombre del titular</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="Como aparece en la tarjeta"
              required
              className={inputClassName}
            />
          </div>

          {/* Exp y CVV */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-gray-700">Vencimiento</label>
              <Input
                value={exp}
                onChange={(e) => setExp(formatExp(e.target.value))}
                placeholder="MM/AA"
                required
                maxLength={5}
                className={`${inputClassName} font-mono`}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Código de seguridad (CVV)</label>
              <Input
                type="password"
                value={cvv}
                onChange={(e) =>
                  setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="•••"
                required
                maxLength={4}
                className={`${inputClassName} font-mono text-xl tracking-widest`}
              />
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100 mt-6 justify-end">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push("/buyer/cards")}
              className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition-all sm:min-w-[160px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Guardar tarjeta
                </>
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}