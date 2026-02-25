package main

// import (
//     "fmt"
//     "time"
// )

// // StartBackgroundTasks roda "para sempre" sem travar o servidor principal
// func StartBackgroundTasks() {
//     go func() {
//         for {
//             fmt.Println("[Worker] Limpando arquivos antigos...")
//             // Aqui você chamaria storage.Compact()
//             time.Sleep(1 * time. hour) // Dorme por 1 hora
//         }
//     }()
// }