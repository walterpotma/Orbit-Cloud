package storage

import (
    "os"
    "log"
)

func CreateItem(key string, geral bool, value string) {
	if geral {
        category = "" 
    } else {
        category = "preferences"
    }

    fileName := filepath.Join("data", user, category, key + ".json")

	dir := filepath.Dir(fileName)
    os.MkdirAll(dir, 0755)

	data := []byte(value)
    err := os.WriteFile(fileName, data, 0644)

    if err != nil {
        fmt.Println("❌ Erro ao gravar arquivo:", err)
    } else {
        fmt.Printf("✅ Arquivo salvo em: %s\n", fileName)
    }
}