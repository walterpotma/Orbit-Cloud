package handler

import (
    "fmt"
    "net/http"
    "orbit-db/storage"
    "encoding/json"
)

func ItemsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	
	case http.MethodGet:
        fmt.Println("Requisição recebida em /api/get")

        query := r.URL.Query()
        user := query.Get("user")
        key := query.Get("key")
        geral := query.Get("geral") == "true"

        data, err := storage.GetItem(user, key, geral)
        if err != nil {
            http.Error(w, "Item não encontrado", http.StatusNotFound)
            return
        }

        response := map[string]json.RawMessage{
            "data": json.RawMessage(data),
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(response)

	case http.MethodPost:
        var input struct {
            User  string      `json:"user"`
            Key   string      `json:"key"`
            Geral bool        `json:"geral"`
            Value interface{} `json:"value"`
        }

        if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
            http.Error(w, "Erro no formato do JSON", http.StatusBadRequest)
            return
        }

        valueBytes, _ := json.Marshal(input.Value)
        valueString := string(valueBytes)

        storage.CreateItem(input.User, input.Key, input.Geral, valueString)

        w.WriteHeader(http.StatusCreated)
        fmt.Fprintf(w, `{"message": "Item %s criado com sucesso"}`, input.Key)

	case http.MethodPatch:
        var input struct {
            User  string      `json:"user"`
            Key   string      `json:"key"`
            Geral bool        `json:"geral"`
            Value interface{} `json:"value"`
        }

        if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
            http.Error(w, "JSON inválido", http.StatusBadRequest)
            return
        }

        patchBytes, _ := json.Marshal(input.Value)
        
        err := storage.PatchItem(input.User, input.Key, input.Geral, string(patchBytes))
        if err != nil {
            http.Error(w, "Erro ao aplicar patch: "+err.Error(), http.StatusInternalServerError)
            return
        }

        fmt.Fprintf(w, `{"message": "Item %s atualizado parcialmente"}`, input.Key)

	case http.MethodDelete:
        fmt.Println("Requisição de exclusão recebida")

        query := r.URL.Query()
        user := query.Get("user")
        key := query.Get("key")
        geral := query.Get("geral") == "true"

        if user == "" || key == "" {
            http.Error(w, "User e Key são obrigatórios na URL", http.StatusBadRequest)
            return
        }

        err := storage.DeleteItem(user, key, geral)
        if err != nil {
            http.Error(w, "Erro ao eliminar: "+err.Error(), http.StatusNotFound)
            return
        }

        w.WriteHeader(http.StatusOK)
        fmt.Fprintf(w, `{"message": "Item %s eliminado com sucesso"}`, key)

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
		fmt.Fprintf(w, `{"error": "Método não suportado"}`)
	}
}