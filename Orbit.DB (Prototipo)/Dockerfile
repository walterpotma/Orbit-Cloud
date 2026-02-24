FROM golang:1.22

WORKDIR /app

# Copia tudo da sua pasta para dentro do container
COPY . .

# Roda direto (sem compilar para binário antes)
CMD ["go", "run", "main.go"]