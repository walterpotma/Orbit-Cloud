#!/bin/bash

APP_NAME=$1
VERSION=$2
APP_FILE=$3

echo "[SH] Iniciando deploy para $APP_NAME"

DOCKER_BUILDKIT=1 docker build -t localhost:5000/$APP_NAME:v$VERSION $APP_FILE
# -------------------------------------------------

if [ $? -ne 0 ]; then
    echo "[SH] Erro ao construir a imagem Docker."
    exit 1
fi

docker push localhost:5000/$APP_NAME:v$VERSION