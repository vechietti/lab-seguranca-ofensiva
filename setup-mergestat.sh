#!/bin/bash

# Script para clonar o repositorio oficial do MergeStat e subir o Docker Compose

REPO_URL="https://github.com/mergestat/mergestat.git"
TARGET_DIR="mergestat-official"

echo "=================================================="
echo "Iniciando configuracao do MergeStat Oficial..."
echo "=================================================="

# Verifica se o Git esta instalado
if ! command -v git &> /dev/null; then
    echo "[ERRO] Git nao encontrado! Instale o Git usando: sudo apt install -y git"
    exit 1
fi

# Verifica se o Docker esta instalado
if ! command -v docker &> /dev/null; then
    echo "[ERRO] Docker nao encontrado! Instale o Docker."
    exit 1
fi

# Clona o repositorio oficial caso nao exista
if [ -d "$TARGET_DIR" ]; then
    echo "[INFO] O diretorio '$TARGET_DIR' ja existe. Pulando a clonagem..."
else
    echo "[INFO] Clonando o repositorio oficial do MergeStat..."
    git clone "$REPO_URL" "$TARGET_DIR"
fi

# Entra na pasta do MergeStat
cd "$TARGET_DIR" || exit 1

# Inicializa os containers
echo "[INFO] Inicializando os containers do MergeStat..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
elif docker compose version &> /dev/null; then
    docker compose up -d
else
    echo "[ERRO] Docker Compose nao encontrado! Instale o docker-compose."
    exit 1
fi

echo "=================================================="
echo "[SUCESSO] MergeStat oficial inicializado!"
echo "Acesse o painel em: http://localhost:3300"
echo "=================================================="
