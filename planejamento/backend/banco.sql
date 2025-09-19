tabela usuarios {
    id
    git id
    nome
    email
    senha
    data
}

tabela subscriptions {
    id
    usuario id
    plano id
    data inicio
    data fim
    status
}

tabela planos {
    id
    nome
    preco
    duracao dias
    descricao
}
tabela pagamentos {
    id
    usuario id
    plano id
    valor
    data pagamento
    metodo pagamento
    status
}
tabela logs_acesso {
    id
    usuario id
    acessos
    data
}