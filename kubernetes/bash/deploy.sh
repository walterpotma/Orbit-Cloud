#!/bin/bash

APP_NAME=$1
APP_FILE=$2
NAMESPACE=$3
VERSION=$4

echo "[SH] Iniciando deploy para $APP_NAME na namespace $NAMESPACE..."

docker build -t localhost:5000/$APP_NAME:v$VERSION ../../$APP_FILE
if [ $? -ne 0 ]; then
    echo "[SH] Erro ao construir a imagem Docker."
    exit 1
fi
docker push localhost:5000/$APP_NAME:v$VERSION
if [ $? -ne 0 ]; then
    echo "[SH] Erro ao enviar a imagem Docker para o registro."
    exit 1
fi
kubectl apply -n $NAMESPACE -f ../$APP_NAME.yaml
if [ $? -eq 0 ]; then
    echo "[SH] Sucesso! Deploy aplicado para $APP_NAME na namespace $NAMESPACE"
    exit 0
else
    echo "[SH] Erro ao aplicar o deploy."
    exit 1
fi