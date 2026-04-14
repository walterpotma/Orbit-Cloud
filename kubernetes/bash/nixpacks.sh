#!/bin/bash
SOURCE_PATH=$1
OUT_PATH=$2

# 1. Força a criação do diretório
mkdir -p "$OUT_PATH"

# 2. Roda o Nixpacks e joga o log num arquivo temporário para ver se ele não está mentindo
nixpacks build "$SOURCE_PATH" --out "$OUT_PATH" > "$OUT_PATH/nixpacks_build.log" 2>&1

# 3. O PULO DO GATO: Force o sistema a listar o arquivo e mude o dono para o usuário da API
ls -la "$OUT_PATH"
sync
chmod -R 777 "$OUT_PATH"

echo "[SH] Finalizado. Verificando se o arquivo nasceu:"
if [ -f "$OUT_PATH/Dockerfile" ]; then
    echo "[SH] Dockerfile existe no disco!"
else
    echo "[SH] ERRO: Dockerfile NÃO existe no disco mesmo após o build!"
fi