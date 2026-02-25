package main

import (
    "fmt"
    "net/http"
)

func main() {
    fmt.Println("🚀 Iniciando OrbitDB...")

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/index.html")
	})

    fmt.Println("Ouvindo na porta 8080...")
    http.ListenAndServe(":8080", nil)
}