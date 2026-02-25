package storage

import (
    "os"
	"fmt"
	"path/filepath"
)

func CreateItem(user string, key string, geral bool, value string) {
	var fileName string
	if geral {
        fileName = filepath.Join("data", user, "preferences.json") 
    } else {
        fileName = filepath.Join("data", user, "preferences", key + ".json")
    }    

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

func GetItem(user string, key string, geral bool) (string, error) {
	var fileName string
	if geral {
		fileName = filepath.Join("data", user, "preferences.json") 
	} else {
		fileName = filepath.Join("data", user, "preferences", key + ".json")
	}
	
	data, err := os.ReadFile(fileName)
	if err != nil {
		return "", err
	}
	return string(data), nil
}