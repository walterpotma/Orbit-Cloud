#!/bin/bash
set -e

MASTER_IP="$1"
MASTER_TOKEN="$2"

sudo ufw allow 6443/tcp
sudo ufw allow 2379:2380/tcp

sudo apt update && sudo apt upgrade -y
sudo apt install -y curl

if [[ -z "$MASTER_IP" || -z "$MASTER_TOKEN" ]]; then
  echo ">> Nenhum MASTER_IP/TOKEN informado"
  echo ">> Inicializando cluster (etcd bootstrap)..."

  curl -sfL https://get.k3s.io | sh -s - server --cluster-init

  echo
  echo ">> Cluster inicializado"
  echo ">> Token:"
  sudo cat /var/lib/rancher/k3s/server/node-token

else
  echo ">> MASTER_IP e TOKEN informados"
  echo ">> Entrando no cluster existente..."

  curl -sfL https://get.k3s.io | sh -s - server \
    --server "https://$MASTER_IP:6443" \
    --token "$MASTER_TOKEN"

  echo ">> Master adicionado ao cluster"
fi