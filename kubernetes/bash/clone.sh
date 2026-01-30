#!/bin/bash

GITHUB_ID=$1
RAW_URL=$2
TOKEN=$3
APP_NAME=$4

BASE_DIR="/data/fast/clients/$GITHUB_ID/tmp"

CLEAN_URL="${RAW_URL#https://}"

AUTH_URL="https://$TOKEN@$CLEAN_URL"

echo "[SH] Iniciando processo para $GITHUB_ID..."

if [ -d "$BASE_DIR" ]; then
    echo "[SH] Removendo workspace antigo..."
    rm -rf "$BASE_DIR"
fi

mkdir -p "/data/fast/clients/$GITHUB_ID/tmp"

echo "[SH] Clonando repositório..."

git clone "$AUTH_URL" "$BASE_DIR/$APP_NAME" --quiet

if [ $? -eq 0 ]; then
    echo "[SH] Sucesso! Repositório clonado em $BASE_DIR"
    exit 0
else
    echo "[SH] Erro ao clonar repositório."
    exit 1
fi