#!/bin/bash

GITHUB_ID=$1
APP_NAME=$2

PROJECT_PATH="/data/fast/clients/$GITHUB_ID/workspace/$APP_NAME"

echo "[SH] Iniciando gerador para: $PROJECT_PATH"

if ! command -v nixpacks &> /dev/null
then
    echo "[SETUP] Instalando Nixpacks..."
    curl -sSL https://nixpacks.com/install.sh | bash
fi

TEMP_OUT="$PROJECT_PATH/.temp_nixpacks"

rm -rf $TEMP_OUT

echo "[INFO] Analisando código..."

nixpacks build $PROJECT_PATH --out $TEMP_OUT --name $APP_NAME --no-build > /dev/null

if [ $? -ne 0 ]; then
    echo "[ERRO] Nixpacks falhou ao analisar o projeto."
    rm -rf $TEMP_OUT
    exit 1
fi

if [ -f "$TEMP_OUT/Dockerfile" ]; then
    GENERATED_DOCKERFILE="$TEMP_OUT/Dockerfile"
elif [ -f "$TEMP_OUT/.nixpacks/Dockerfile" ]; then
    GENERATED_DOCKERFILE="$TEMP_OUT/.nixpacks/Dockerfile"
else
    echo "[ERRO] Dockerfile não encontrado na saída do Nixpacks."
    rm -rf $TEMP_OUT
    exit 1
fi

mv "$GENERATED_DOCKERFILE" "$PROJECT_PATH/Dockerfile"
echo "[SUCESSO] Dockerfile movido."

if [ -d "$TEMP_OUT/.nixpacks" ]; then
    rm -rf "$PROJECT_PATH/.nixpacks"
    
    mv "$TEMP_OUT/.nixpacks" "$PROJECT_PATH/.nixpacks"
    echo "[SUCESSO] Pasta de dependências .nixpacks movida."
else
    echo "[AVISO] Pasta .nixpacks não foi gerada (alguns projetos não precisam)."
fi

rm -rf $TEMP_OUT

exit 0