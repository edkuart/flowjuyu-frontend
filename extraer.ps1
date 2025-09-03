$extensiones = @(".ts", ".tsx", ".js", ".jsx", ".json", ".mjs", ".cjs")
$excluirCarpetas = @("node_modules", "dist", "build", ".next", "out", "coverage", ".git", ".pnpm")

# Si ya existe, eliminar el archivo
if (Test-Path "AllCode.txt") {
    Remove-Item "AllCode.txt"
}

Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
    $extension = $_.Extension.ToLower()
    $ruta = $_.FullName.ToLower()

    # Verificar si está en carpetas excluidas
    $enCarpetaExcluida = $false
    foreach ($carpeta in $excluirCarpetas) {
        if ($ruta -like "*$carpeta*") {
            $enCarpetaExcluida = $true
            break
        }
    }

    if ($extensiones -contains $extension -and -not $enCarpetaExcluida) {
        "----- FILE: $($_.FullName) -----`r`n" | Out-File -Append "AllCode.txt"

        try {
            Get-Content -Path $_.FullName -ErrorAction Stop | Out-File -Append "AllCode.txt"
        } catch {
            "`r`n**ERROR AL LEER EL ARCHIVO: $($_.FullName)**`r`n" | Out-File -Append "AllCode.txt"
        }

        "`r`n`r`n" | Out-File -Append "AllCode.txt"
    }
}
