# Script PowerShell para clonar o repositório oficial do MergeStat e subir o Docker Compose no Windows

$RepoUrl = "https://github.com/mergestat/mergestat.git"
$TargetDir = "mergestat-official"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Iniciando configuração do MergeStat Oficial no Windows..." -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Verifica se o Git está instalado
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERRO] Git não encontrado! Instale o Git para Windows." -ForegroundColor Red
    Exit
}

# Verifica se o Docker está instalado
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "[ERRO] Docker não encontrado! Instale o Docker Desktop para Windows." -ForegroundColor Red
    Exit
}

# Clona o repositório oficial caso não exista
if (Test-Path $TargetDir) {
    Write-Host "[INFO] O diretório '$TargetDir' já existe. Pulando a clonagem..." -ForegroundColor Yellow
} else {
    Write-Host "[INFO] Clonando o repositório oficial do MergeStat..." -ForegroundColor Green
    git clone $RepoUrl $TargetDir
}

# Entra na pasta do MergeStat
Set-Location $TargetDir

# Inicializa os contêineres
Write-Host "[INFO] Inicializando os contêineres do MergeStat..." -ForegroundColor Green
docker compose up -d

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "[SUCESSO] MergeStat oficial inicializado!" -ForegroundColor Green
Write-Host "Acesse o painel em: http://localhost:3300" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
