# Skrypt do regeneracji Prisma Client
# Uruchom gdy występują problemy z plikiem .dll.node

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Prisma Client Regeneration" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "WAŻNE: Zamknij wszystkie terminale i serwery Node.js!" -ForegroundColor Yellow
Write-Host "Naciśnij Enter aby kontynuować..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "Krok 1: Czyszczenie cache Prisma..." -ForegroundColor Yellow

if (Test-Path "node_modules\.prisma") {
    Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue
    Write-Host "✓ Cache wyczyszczony" -ForegroundColor Green
} else {
    Write-Host "ℹ Cache już jest pusty" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Krok 2: Generowanie Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Prisma Client wygenerowany" -ForegroundColor Green
} else {
    Write-Host "✗ Błąd podczas generowania" -ForegroundColor Red
    Write-Host ""
    Write-Host "Rozwiązanie:" -ForegroundColor Yellow
    Write-Host "1. Zamknij VS Code całkowicie" -ForegroundColor White
    Write-Host "2. Zamknij wszystkie terminale PowerShell" -ForegroundColor White
    Write-Host "3. Uruchom ponownie VS Code" -ForegroundColor White
    Write-Host "4. Spróbuj ponownie" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "    Gotowe!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Możesz uruchomić serwer: npm run dev" -ForegroundColor White
Write-Host ""
