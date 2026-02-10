#!/bin/bash

GITHUB_ID=$1
APP_NAME=$2

PROJECT_PATH="/data/archive/clients/$GITHUB_ID/tmp/$APP_NAME"

echo "[SH] Gerando Dockerfile para: $PROJECT_PATH"

if ! command -v nixpacks &> /dev/null
then
    echo "[SETUP] Instalando Nixpacks..."
    curl -sSL https://nixpacks.com/install.sh | bash
fi

rm -f "$PROJECT_PATH/Dockerfile"
rm -rf "$PROJECT_PATH/.nixpacks"
rm -rf "$PROJECT_PATH/.temp_nixpacks_build"

nixpacks build "$PROJECT_PATH" --out "$PROJECT_PATH" --name "$APP_NAME" > /dev/null

if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao executar nixpacks build."
    exit 1
fi

if [ -f "$PROJECT_PATH/.nixpacks/Dockerfile" ]; then
    mv "$PROJECT_PATH/.nixpacks/Dockerfile" "$PROJECT_PATH/Dockerfile"
    echo "[INFO] Dockerfile movido de .nixpacks/ para a raiz."
fi

if [ ! -f "$PROJECT_PATH/Dockerfile" ]; then
    echo "[ERRO] O Dockerfile não foi encontrado nem na raiz nem na subpasta."
    exit 1
fi

if id "hayom" &>/dev/null; then
    chown hayom:hayom "$PROJECT_PATH/Dockerfile"
    chown -R hayom:hayom "$PROJECT_PATH/.nixpacks" 2>/dev/null
else
    chmod 777 "$PROJECT_PATH/Dockerfile"
    chmod -R 777 "$PROJECT_PATH/.nixpacks" 2>/dev/null
fi

echo "[SUCESSO] Dockerfile pronto na raiz."
exit 0