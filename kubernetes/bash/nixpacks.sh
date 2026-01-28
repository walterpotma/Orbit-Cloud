#!/bin/bash

GITHUB_ID=$1
APP_NAME=$2

# 1. Caminhos Absolutos (Evita erros de "onde estou?")
BASE_DIR="/data/fast/clients/$GITHUB_ID/workspace/$APP_NAME"
TEMP_DIR="$BASE_DIR/.temp_nixpacks_build"
TARGET_DOCKERFILE="$BASE_DIR/Dockerfile"
TARGET_NIXPACKS_DIR="$BASE_DIR/.nixpacks"

echo "[SH] Iniciando gerador para: $APP_NAME"
echo "[SH] Diretório Base: $BASE_DIR"

# 2. Instalação do Nixpacks (se não existir)
if ! command -v nixpacks &> /dev/null
then
    echo "[SETUP] Nixpacks não encontrado. Instalando..."
    curl -sSL https://nixpacks.com/install.sh | bash
fi

# 3. Limpeza de tentativas anteriores
rm -rf "$TEMP_DIR"
rm -rf "$TARGET_NIXPACKS_DIR" # Remove a pasta .nixpacks antiga para não misturar
mkdir -p "$TEMP_DIR"

echo "[INFO] Gerando arquivos de build..."

# 4. Executa o Nixpacks
# --out define a pasta de saída
# --no-build apenas gera os arquivos (Dockerfile + .nixpacks)
nixpacks build "$BASE_DIR" --out "$TEMP_DIR" --name "$APP_NAME" --no-build > /dev/null

if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao executar nixpacks build."
    exit 1
fi

# 5. DEBUG: Mostra o que foi gerado (Isso vai aparecer no seu log do C#)
echo "[DEBUG] Conteúdo gerado na pasta temporária:"
ls -la "$TEMP_DIR"

# 6. Mover Dockerfile
if [ -f "$TEMP_DIR/Dockerfile" ]; then
    mv "$TEMP_DIR/Dockerfile" "$TARGET_DOCKERFILE"
    echo "[SUCESSO] Dockerfile movido para a raiz."
elif [ -f "$TEMP_DIR/.nixpacks/Dockerfile" ]; then
    # As vezes o Nixpacks joga o Dockerfile dentro da pasta .nixpacks
    mv "$TEMP_DIR/.nixpacks/Dockerfile" "$TARGET_DOCKERFILE"
    echo "[SUCESSO] Dockerfile (interno) movido para a raiz."
else
    echo "[ERRO] Dockerfile não encontrado na saída."
    exit 1
fi

# 7. Mover a pasta .nixpacks (O CORAÇÃO DO PROBLEMA)
if [ -d "$TEMP_DIR/.nixpacks" ]; then
    mv "$TEMP_DIR/.nixpacks" "$TARGET_NIXPACKS_DIR"
    echo "[SUCESSO] Pasta de dependências .nixpacks movida."
else
    echo "[AVISO] Nenhuma pasta .nixpacks foi gerada. O Dockerfile pode falhar se depender dela."
fi

# 8. Limpeza e Permissões (Para o deploy.sh não falhar)
rm -rf "$TEMP_DIR"

# Força o dono para o usuário 'hayom' (pois a API roda como root)
# Se o usuário 'hayom' não existir no container da API, este comando pode falhar, 
# mas o 'deploy.sh' roda no host, então geralmente é melhor deixar permissão aberta ou corrigir no host.
# Vou usar chmod 777 provisoriamente para garantir que qualquer um leia, ou tentar chown se soubermos o ID.
chmod -R 777 "$BASE_DIR/.nixpacks" 2>/dev/null
chmod 777 "$TARGET_DOCKERFILE" 2>/dev/null

echo "[CONCLUIDO] Geração finalizada."
exit 0