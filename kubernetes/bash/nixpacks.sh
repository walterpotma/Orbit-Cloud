#!/bin/bash

GITHUB_ID=$1
APP_NAME=$2

PROJECT_PATH="./data/fast/clients/$GITHUB_ID/workspace/$APP_NAME"

echo "[SH] Iniciando gerador para: $PROJECT_PATH"

if ! command -v nixpacks &> /dev/null
then
    echo "[SETUP] Instalando Nixpacks..."
    curl -sSL https://nixpacks.com/install.sh | bash
fi

TEMP_OUT="$PROJECT_PATH/.temp_nixpacks"

echo "[INFO] Analisando código..."
nixpacks build $PROJECT_PATH --out $TEMP_OUT --name $APP_NAME > /dev/null

if [ $? -ne 0 ]; then
    echo "[ERRO] Nixpacks falhou ao analisar o projeto."
    rm -rf $TEMP_OUT
    exit 1
fi

GENERATED_FILE="$TEMP_OUT/.nixpacks/Dockerfile"
TARGET_FILE="$PROJECT_PATH/Dockerfile"

if [ -f "$GENERATED_FILE" ]; then
    mv "$GENERATED_FILE" "$TARGET_FILE"
    echo "[SUCESSO] Dockerfile movido para a raiz do projeto."
    
    rm -rf $TEMP_OUT
    
    exit 0
else
    echo "[ERRO] Dockerfile não foi gerado."
    rm -rf $TEMP_OUT
    exit 1
fi