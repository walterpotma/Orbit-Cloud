package main

import (
    "fmt"
    "net/http"
    "orbit-db/storage"
)

func main() {
    fmt.Println("🚀 Iniciando OrbitDB...")

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/index.html")
	})
    http.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Requisição recebida em /api")
        w.Header().Set("Content-Type", "application/json")
        w.Write([]byte(`{"message": "Olá do OrbitDB!"}`))
	})
    http.HandleFunc("/api/get", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Requisição recebida em /api/get")
        w.Header().Set("Content-Type", "application/json")
        w.Write([]byte(`{"data": "Dados de exemplo do OrbitDB"}`))
	})
    http.HandleFunc("/api/set", func(w http.ResponseWriter, r *http.Request) {
        query := r.URL.Query()
    
        key := query.Get("key")
        geral := query.Get("geral") == "true"
        value := query.Get("val")

        if key == "" || value == "" {
            http.Error(w, "Faltou key ou val!", http.StatusBadRequest)
            return
        }

		fmt.Println("Requisição recebida em /api/set")
        w.Header().Set("Content-Type", "application/json")
        storage.CreateItem(key, value)
        w.Write([]byte(`{"status": "Item salvo com sucesso"}`))
	})

    fmt.Println("Ouvindo na porta 8080...")
    http.ListenAndServe(":8080", nil)
}