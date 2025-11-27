# Script para finalizar setup após configurar DATABASE_URL
# Execute: .\finalizar-setup.ps1

Write-Host "🚀 Finalizando setup do backend..." -ForegroundColor Cyan
Write-Host ""

# Verificar se .env existe
if (-not (Test-Path .env)) {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
    Write-Host "   Crie o arquivo .env primeiro (veja INICIO_RAPIDO.md)" -ForegroundColor Yellow
    exit 1
}

# Verificar se DATABASE_URL está configurado
$envContent = Get-Content .env
$dbUrl = $envContent | Where-Object { $_ -match "DATABASE_URL" }

if ($dbUrl -match "user:password" -or $dbUrl -match "localhost:5432/telegram_groups") {
    Write-Host "⚠️  DATABASE_URL ainda não foi configurado!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Configure o DATABASE_URL no arquivo .env:" -ForegroundColor Cyan
    Write-Host "   1. Se usar Supabase: Cole a connection string" -ForegroundColor Yellow
    Write-Host "   2. Se usar PostgreSQL local: Atualize com suas credenciais" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Veja INICIO_RAPIDO.md para instruções detalhadas" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ DATABASE_URL configurado" -ForegroundColor Green
Write-Host ""

# Executar migrations
Write-Host "🔄 Criando tabelas no banco de dados..." -ForegroundColor Yellow
npm run prisma:migrate

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Setup completo! Tabelas criadas com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Para iniciar o servidor:" -ForegroundColor Cyan
    Write-Host "   npm run dev" -ForegroundColor Green
    Write-Host ""
    Write-Host "📡 Servidor estará em: http://localhost:3000" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Erro ao criar tabelas" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifique:" -ForegroundColor Yellow
    Write-Host "   1. Se o banco de dados existe" -ForegroundColor Yellow
    Write-Host "   2. Se a DATABASE_URL está correta" -ForegroundColor Yellow
    Write-Host "   3. Se o PostgreSQL está rodando (se for local)" -ForegroundColor Yellow
}





