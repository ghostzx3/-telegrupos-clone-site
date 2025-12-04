# Script de Setup Automático Completo
# Execute: .\setup-automatico.ps1

Write-Host "🚀 Iniciando setup automático do backend..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Node.js
Write-Host "📦 Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js não encontrado. Instale Node.js primeiro." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green

# 2. Instalar dependências
Write-Host ""
Write-Host "📥 Instalando dependências npm..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependências instaladas" -ForegroundColor Green

# 3. Gerar cliente Prisma
Write-Host ""
Write-Host "🔧 Gerando cliente Prisma..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Aviso: Erro ao gerar Prisma. Verifique se o .env está configurado." -ForegroundColor Yellow
} else {
    Write-Host "✅ Cliente Prisma gerado" -ForegroundColor Green
}

# 4. Tentar criar banco de dados
Write-Host ""
Write-Host "🗄️  Tentando criar banco de dados..." -ForegroundColor Yellow

# Procurar psql
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        break
    }
}

if ($psqlPath) {
    Write-Host "✅ PostgreSQL encontrado: $psqlPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Para criar o banco, você precisa:" -ForegroundColor Cyan
    Write-Host "   1. Abrir pgAdmin ou psql" -ForegroundColor Yellow
    Write-Host "   2. Executar: CREATE DATABASE telegram_groups;" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Ou execute manualmente:" -ForegroundColor Yellow
    Write-Host "   & '$psqlPath' -U postgres -c 'CREATE DATABASE telegram_groups;'" -ForegroundColor Gray
} else {
    Write-Host "⚠️  PostgreSQL não encontrado automaticamente." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Para criar o banco de dados:" -ForegroundColor Cyan
    Write-Host "   1. Instale PostgreSQL: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "   2. Ou use um serviço online como Supabase/Neon" -ForegroundColor Yellow
    Write-Host "   3. Depois execute: CREATE DATABASE telegram_groups;" -ForegroundColor Yellow
}

# 5. Tentar executar migrations
Write-Host ""
Write-Host "🔄 Tentando executar migrations..." -ForegroundColor Yellow
Write-Host "⚠️  Isso só funcionará se o banco já existir e estiver configurado no .env" -ForegroundColor Yellow

# Verificar se DATABASE_URL está configurado
$envContent = Get-Content .env -ErrorAction SilentlyContinue
$hasDbUrl = $envContent | Where-Object { $_ -match "DATABASE_URL" -and $_ -notmatch "user:password" }

if ($hasDbUrl) {
    npm run prisma:migrate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migrations executadas com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Erro ao executar migrations. Verifique se o banco existe e está acessível." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  DATABASE_URL não configurado no .env" -ForegroundColor Yellow
    Write-Host "   Configure com suas credenciais do PostgreSQL antes de executar migrations." -ForegroundColor Yellow
}

# Resumo
Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Setup concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Configure DATABASE_URL no arquivo .env" -ForegroundColor Yellow
Write-Host "   2. Crie o banco: CREATE DATABASE telegram_groups;" -ForegroundColor Yellow
Write-Host "   3. Execute: npm run prisma:migrate" -ForegroundColor Yellow
Write-Host "   4. Execute: npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Para iniciar o servidor:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan










