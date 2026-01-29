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

# 2. Limpeza preventiva (Remove Dockerfile e .nixpacks antigos para garantir versão nova)
rm -f "$PROJECT_PATH/Dockerfile"
rm -rf "$PROJECT_PATH/.nixpacks"

# 3. GERAÇÃO DIRETA
# --out "$PROJECT_PATH": Diz pro Nixpacks escrever os arquivos direto na raiz do projeto
# --no-build: Apenas gera os arquivos
nixpacks build "$PROJECT_PATH" --out "$PROJECT_PATH" --name "$APP_NAME" --no-build > /dev/null

if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao executar nixpacks build."
    exit 1
fi

# 4. CORREÇÃO DE PERMISSÕES (CRUCIAL)
# Como a API roda como root, os arquivos nascem como root. 
# Precisamos devolver para o usuário 'hayom' para o deploy funcionar.
# Se o usuário do sistema não for 1000:1000, ajuste aqui, mas geralmente 'hayom' funciona se o nome existir.

if id "hayom" &>/dev/null; then
    chown hayom:hayom "$PROJECT_PATH/Dockerfile"
    # O -R é importante porque .nixpacks é uma pasta com arquivos dentro
    chown -R hayom:hayom "$PROJECT_PATH/.nixpacks" 2>/dev/null 
else
    # Fallback: Se não achar o usuário hayom, libera geral para leitura/escrita
    chmod 777 "$PROJECT_PATH/Dockerfile"
    chmod -R 777 "$PROJECT_PATH/.nixpacks" 2>/dev/null
fi

echo "[SUCESSO] Arquivos gerados na raiz do projeto."
exit 0