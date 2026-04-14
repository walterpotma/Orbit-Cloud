#!/bin/bash
# $1 = Path do código, $2 = Path de saída
SOURCE_PATH=$1
OUT_PATH=$2

echo "[SH] Rodando Nixpacks em $SOURCE_PATH..."

# Garante que a pasta de saída existe
mkdir -p "$OUT_PATH"

# Executa o build (gerando apenas os arquivos)
nixpacks build "$SOURCE_PATH" --out "$OUT_PATH"

# O SEGREDO: Força o Sistema de Arquivos a descarregar o cache para o disco
sync

# Garante permissão total para a API ler o resultado
chmod -R 777 "$OUT_PATH"

echo "[SH] Finalizado."