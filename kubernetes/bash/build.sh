#!/bin/bash
GITHUB_ID=$1
APP_NAME=$2
VERSION=$3
APP_PATH=$4

REGISTRY="localhost:5000"

IMAGE_TAG="$REGISTRY/$GITHUB_ID/$APP_NAME:v$VERSION"

CLIENT_ROOT="/data/archive/clients/$GITHUB_ID"

echo "[SH] -----------------------------------------------------------"
echo "[SH] Iniciando Processo de Build"
echo "[SH] Imagem: $IMAGE_TAG"
echo "[SH] Destino Físico: $TAR_FILE"
echo "[SH] -----------------------------------------------------------"

DOCKER_BUILDKIT=1 docker build --progress=plain -t $IMAGE_TAG $CLIENT_ROOT/tmp/$APP_PATH

if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao construir a imagem Docker."
    exit 1
fi

echo "[SH] Enviando para o Registry..."
docker push $IMAGE_TAG

if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao enviar para o Registry."
    exit 1
fi