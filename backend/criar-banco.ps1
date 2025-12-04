# Script PowerShell para criar banco de dados PostgreSQL
# Execute: .\criar-banco.ps1

Write-Host "🔍 Procurando PostgreSQL..." -ForegroundColor Cyan

# Caminhos comuns do PostgreSQL no Windows
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        Write-Host "✅ PostgreSQL encontrado em: $path" -ForegroundColor Green
        break
    }
}

if (-not $psqlPath) {
    Write-Host "❌ PostgreSQL não encontrado nos caminhos padrão." -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, execute manualmente:" -ForegroundColor Yellow
    Write-Host "1. Abra o pgAdmin ou encontre o psql.exe" -ForegroundColor Yellow
    Write-Host "2. Execute: CREATE DATABASE telegram_groups;" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ou consulte o arquivo CRIAR_BANCO.md para mais opções." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📝 Criando banco de dados 'telegram_groups'..." -ForegroundColor Cyan
Write-Host ""

# Solicitar credenciais
$username = Read-Host "Digite o usuário do PostgreSQL (padrão: postgres)"
if ([string]::IsNullOrWhiteSpace($username)) {
    $username = "postgres"
}

$password = Read-Host "Digite a senha do PostgreSQL" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

# Definir variável de ambiente para senha
$env:PGPASSWORD = $passwordPlain

try {
    # Criar banco de dados
    $createDbCommand = "CREATE DATABASE telegram_groups;"
    & $psqlPath -U $username -d postgres -c $createDbCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Banco de dados 'telegram_groups' criado com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Atualize o arquivo .env com:" -ForegroundColor Cyan
        Write-Host "DATABASE_URL=`"postgresql://$username`:SUA_SENHA@localhost:5432/telegram_groups?schema=public`"" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "❌ Erro ao criar banco de dados." -ForegroundColor Red
        Write-Host "Verifique as credenciais e se o PostgreSQL está rodando." -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erro: $_" -ForegroundColor Red
} finally {
    # Limpar senha da memória
    $env:PGPASSWORD = $null
    $passwordPlain = $null
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")










