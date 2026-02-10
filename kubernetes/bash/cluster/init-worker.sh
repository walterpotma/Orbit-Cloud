MASTER_IP= $1
MASTER_TOKEN= $2

sudo apt update && sudo apt upgrade -y
sudo apt install -y curl

curl -sfL https://get.k3s.io | K3S_URL=https://$MASTER_IP:6443 K3S_TOKEN=$MASTER_TOKEN sh -


# sudo cat /var/lib/rancher/k3s/server/node-token
