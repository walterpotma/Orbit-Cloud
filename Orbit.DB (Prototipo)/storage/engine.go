package storage

import (
    "sync"
)

// DB é a struct principal que será usada lá no main.go
type DB struct {
    Path string
    mu   sync.RWMutex
}

// Init cria o banco
func Init(path string) *DB {
    return &DB{Path: path}
}

// Set grava no disco
func (db *DB) Set(key string, value any) error {
    db.mu.Lock()
    defer db.mu.Unlock()
    // ... lógica de append no arquivo ...
    return nil
}