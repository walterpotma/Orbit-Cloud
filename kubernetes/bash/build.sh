#!/bin/bash

# Parâmetros recebidos da API
GITHUB_ID=$1       # Ex: 201145284
APP_NAME=$2        # Ex: orbitcloud-app
VERSION=$3         # Ex: 0.0.12
APP_PATH=$4        # Onde está o Dockerfile (/data/fast/clients/...)

# Configurações
REGISTRY="localhost:5000"
# Nova Tag Organizada: localhost:5000/CLIENTE_ID/NOME_APP:VERSAO
IMAGE_TAG="$REGISTRY/$GITHUB_ID/$APP_NAME:v$VERSION"

# Caminhos físicos
CLIENT_ROOT="/data/fast/clients/$GITHUB_ID"
IMAGES_DIR="$CLIENT_ROOT/images"
TAR_FILE="$IMAGES_DIR/$APP_NAME-v$VERSION.tar"

echo "[SH] -----------------------------------------------------------"
echo "[SH] Iniciando Processo de Build"
echo "[SH] Imagem: $IMAGE_TAG"
echo "[SH] Destino Físico: $TAR_FILE"
echo "[SH] -----------------------------------------------------------"

# 1. Garante que a pasta de imagens existe
if [ ! -d "$IMAGES_DIR" ]; then
    mkdir -p "$IMAGES_DIR"
    # Se o script rodar como root, ajusta para seu usuário
    if id "hayom" &>/dev/null; then
        chown hayom:hayom "$IMAGES_DIR"
    fi
fi

# 2. BUILD (Cria a imagem no Docker Engine)
# Adicionei --progress=plain para o log ficar legível se você capturar no C#
DOCKER_BUILDKIT=1 docker build --progress=plain -t $IMAGE_TAG $APP_PATH

if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao construir a imagem Docker."
    exit 1
fi

# 3. PUSH (Envia para o Registry Local - Necessário para o Kubernetes)
echo "[SH] Enviando para o Registry..."
docker push $IMAGE_TAG

if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao enviar para o Registry."
    exit 1
fi