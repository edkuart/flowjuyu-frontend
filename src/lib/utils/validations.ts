export function validarTelefonoGT(input: string): string {
  const limpio = input.replace(/\D/g, '') // solo dígitos
  const validado = limpio.slice(0, 8)
  return validado
}

export function esTelefonoGuatemala(input: string): boolean {
  return /^[2-7][0-9]{7}$/.test(input)
}
