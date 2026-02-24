package iam

func ValidateToken(token string) bool {
    // Lógica simples: "Se token for 123, libera"
    return token == "super-secret-123"
}

func ValidateUser(user string, senha string) bool {
    // Lógica simples: "Se usuário for 'admin' e senha for '123', libera"
    return user == "admin" && senha == "123"
}