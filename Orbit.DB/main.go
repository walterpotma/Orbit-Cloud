package main

import (
    "fmt"
    "net/http"
    "orbit-db/handler"
)

type Item struct {
	Key   string `json:"key"`
	Value string `json:"value"`
	Geral bool `json:"geral"`
}
type newItem struct {
    User string `json:"user"`
    Key   string `json:"key"`
    Value string `json:"value"`
    Geral bool `json:"geral"`
}

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

    http.HandleFunc("/api/v1", handler.ItemsHandler)

    fmt.Println("Ouvindo na porta 8080...")
    http.ListenAndServe(":8080", nil)
}