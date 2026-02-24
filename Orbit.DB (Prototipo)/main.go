package main

import (
    "fmt"
    "net/http"
    "orbit-db/iam"      // Importando sua pasta iam
    "orbit-db/storage"  // Importando sua pasta storage
)

var database *storage.DB // Variável global do banco

func main() {
    fmt.Println("🚀 Iniciando OrbitDB...")

    database = storage.Init("./data")

    // 2. Inicia o Worker em background (não trava o código)
    // StartBackgroundTasks()

    // 3. Define rotas da API
    http.HandleFunc("/set", handleSet) // handler definido no api.go
    http.HandleFunc("/get", handleGet) 

    // 4. Sobe o servidor
    fmt.Println("Ouvindo na porta 8080...")
    http.ListenAndServe(":8080", nil)
}

// Exemplo de handler simples
func handleSet(w http.ResponseWriter, r *http.Request) {
    // Usa o IAM
    token := r.Header.Get("Authorization")
    if !iam.ValidateToken(token) {
        http.Error(w, "Proibido", 403)
        return
    }

    database.Set("chave", "valor")
    fmt.Fprintln(w, "Salvo!")
}

func handleRequest(w http.ResponseWriter, r *http.Request) {
    // 1. Quem é o usuário? (Via Header)
    userID := r.Header.Get("X-User-ID") // ex: "cliente_loja_1"
    
    // 2. Segurança: O usuário existe? O token bate?
    if !iam.ValidateUser(userID, r.Header.Get("X-User-Token")) {
        http.Error(w, "Proibido", 403)
        return // 403 Forbidden
    }

    // 3. A MÁGICA: O Engine aponta para a pasta DELE dinamicamente
    // O usuário nem sabe que isso é uma pasta no Linux
    caminhoDoUsuario := fmt.Sprintf("/var/lib/orbit/data/%s", userID)
    
    // 4. Instancia o banco SÓ para aquela requisição
    db := storage.NewOrbitDB(caminhoDoUsuario)
    
    // 5. Executa a ação
    db.Set("produto_1", "Camiseta")
}