#!/bin/bash

GITHUB_ID=$1
APP_NAME=$2

# Caminho absoluto da pasta do projeto
PROJECT_PATH="/data/fast/clients/$GITHUB_ID/workspace/$APP_NAME"

echo "[SH] Gerando Dockerfile diretamente em: $PROJECT_PATH"

# 1. Instalação do Nixpacks (se não existir)
if ! command -v nixpacks &> /dev/null
then
    echo "[SETUP] Instalando Nixpacks..."
    curl -sSL https://nixpacks.com/install.sh | bash
fi

# 2. Limpeza preventiva
rm -f "$PROJECT_PATH/Dockerfile"
rm -rf "$PROJECT_PATH/.nixpacks"

# 3. GERAÇÃO DIRETA
# --out: Define a pasta de saída. Ao usar isso, o Nixpacks já entende que é para salvar os arquivos.
# Removido: --no-build (que causava o erro)
nixpacks build "$PROJECT_PATH" --out "$PROJECT_PATH" --name "$APP_NAME" > /dev/null

if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao executar nixpacks build."
    exit 1
fi

# 4. CORREÇÃO DE PERMISSÕES
# Garante que o usuário 'hayom' consiga ler os arquivos gerados pelo root
if id "hayom" &>/dev/null; then
    chown hayom:hayom "$PROJECT_PATH/Dockerfile"
    chown -R hayom:hayom "$PROJECT_PATH/.nixpacks" 2>/dev/null 
else
    chmod 777 "$PROJECT_PATH/Dockerfile"
    chmod -R 777 "$PROJECT_PATH/.nixpacks" 2>/dev/null
fi

echo "[SUCESSO] Arquivos gerados na raiz do projeto."
exit 0