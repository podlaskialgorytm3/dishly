# Skrypt do inicjalizacji bazy danych DISHLY
# Uruchom ten skrypt po zatrzymaniu serwera deweloperskiego

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "    DISHLY Database Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Krok 1: Generowanie Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "BŁĄD: Nie udało się wygenerować Prisma Client" -ForegroundColor Red
    Write-Host "Upewnij się, że zatrzymałeś serwer deweloperski (Ctrl+C)" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Prisma Client wygenerowany" -ForegroundColor Green
Write-Host ""

Write-Host "Krok 2: Synchronizacja schematu z bazą danych..." -ForegroundColor Yellow
npx prisma db push

if ($LASTEXITCODE -ne 0) {
    Write-Host "BŁĄD: Nie udało się zsynchronizować bazy danych" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Baza danych zsynchronizowana" -ForegroundColor Green
Write-Host ""

Write-Host "Krok 3: Dodawanie początkowych danych (seed)..." -ForegroundColor Yellow
npx prisma db seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "UWAGA: Seed może się nie udać, jeśli dane już istnieją" -ForegroundColor Yellow
}

Write-Host "✓ Dane początkowe dodane" -ForegroundColor Green
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "    Setup zakończony!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Możesz teraz uruchomić serwer deweloperski:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
