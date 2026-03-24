package storage

import (
	"os"
	"fmt"
	"path/filepath"
    "encoding/json"
)

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

func PatchItem(user string, key string, geral bool, patchData string) error {
	fileName := ""
	if geral {
		fileName = filepath.Join("data", user, key+".json")
	} else {
		fileName = filepath.Join("data", user, "preferences", key+".json")
	}

	existingData, err := os.ReadFile(fileName)
	if err != nil {
		return err
	}

	var currentMap map[string]interface{}
	var patchMap map[string]interface{}

	json.Unmarshal(existingData, &currentMap)
	json.Unmarshal([]byte(patchData), &patchMap)

	for k, v := range patchMap {
		currentMap[k] = v
	}

	updatedJSON, _ := json.Marshal(currentMap)
	return os.WriteFile(fileName, updatedJSON, 0644)
}

func DeleteItem(user string, key string, geral bool) error {
	var category string
	if geral {
		category = ""
	} else {
		category = "preferences"
	}

	fileName := filepath.Join("data", user, category, key+".json")

	err := os.Remove(fileName)
	if err != nil {
		return err
	}
	return nil
}