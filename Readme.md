src/
├── Orbit.Domain/                # O CORAÇÃO (Sem dependências externas)
│   ├── Entities/                # Suas tabelas do banco (Account, Plan, Deployment)
│   ├── Enums/                   # (DeployStatus, UserRole)
│   ├── Exceptions/              # Erros de negócio (Ex: InsufficientFundsException)
│   └── Interfaces/              # Contratos do Repositório (IAccountRepository)
│
├── Orbit.Application/           # A LÓGICA (Casos de uso)
│   ├── DTOs/                    # Objetos de transporte (Requests/Responses)
│   ├── Interfaces/              # Contratos de Serviços (IKubernetesService)
│   ├── Services/                # Regras de negócio puras (Ex: Validar se pode fazer deploy)
│   └── Validators/              # FluentValidation (Ex: GithubId não pode ser vazio)
│
├── Orbit.Infrastructure/        # A IMPLEMENTAÇÃO TÉCNICA (Onde a mágica acontece)
│   ├── Data/                    # DbContext e Migrations
│   ├── Repositories/            # Implementação dos Repositórios (SQL)
│   ├── ExternalServices/        # Integrações
│   │   ├── Kubernetes/          # Cliente K8s (KubernetesClient)
│   │   ├── Docker/              # DockerClient / Kaniko Jobs
│   │   ├── FileSystem/          # Manipulação de arquivos
│   │   └── Github/              # API do Github
│   └── BackgroundJobs/          # Jobs recorrentes (limpeza, billing)
│
└── Orbit.Api/                   # A PORTA DE ENTRADA
    ├── Controllers/             # Apenas recebem HTTP e chamam Application
    ├── Configurations/          # Configuração de DI (Dependency Injection)
    ├── Middlewares/             # Tratamento global de erros
    └── Program.cs