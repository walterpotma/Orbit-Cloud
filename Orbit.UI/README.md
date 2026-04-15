🪐 Orbit Cloud - Planos & Identidade Visual
"Potência de Datacenter com preço de Home Lab."

Este documento define a hierarquia de recursos e a paleta de cores baseada em corpos celestes para os diferentes níveis de serviço da Orbit Cloud.

🎨 Especificação de Cores (Design System)
Cada plano utiliza uma paleta de 9 tonalidades seguindo a estrutura --theme-[n]:

1, 2, 3: Fundo (Primário, Secundário, Terciário)

4, 5: Bordas (Sutil e Destaque)

6: Destaque (Brand / Botões)

7, 8, 9: Texto (Primário, Secundário, Mudo)

🚀 Níveis de Serviço
🌑 Moon (Micro)
Ideal para pequenos bots e testes rápidos.

Recursos: 250m CPU | 500Mi RAM | 10GB Disco

Paleta:

CSS
:root .theme-moon {
  --theme-1: #09090b; --theme-2: #18181b; --theme-3: #27272a;
  --theme-4: #3f3f46; --theme-5: #52525b;
  --theme-6: #e2e8f0; 
  --theme-7: #ffffff; --theme-8: #a1a1aa; --theme-9: #71717a;
}
🔴 Mars (Starter)
Para aplicações web em estágio inicial.

Recursos: 500m CPU | 1Gi RAM | 20GB Disco

Paleta:

CSS
:root .theme-mars {
  --theme-1: #090101; --theme-2: #1a0505; --theme-3: #2d0a0a;
  --theme-4: #450a0a; --theme-5: #7f1d1d;
  --theme-6: #f87171; 
  --theme-7: #fef2f2; --theme-8: #fca5a5; --theme-9: #991b1b;
}
🪐 Neptune (Advanced)
O equilíbrio perfeito. O padrão Orbit.

Recursos: 1000m CPU | 2Gi RAM | 50GB Disco

Paleta:

CSS
:root .theme-neptune {
  --theme-1: #020617; --theme-2: #0f172a; --theme-3: #1e293b;
  --theme-4: #1e3a8a; --theme-5: #2563eb;
  --theme-6: #38bdf8; 
  --theme-7: #f0f9ff; --theme-8: #7dd3fc; --theme-9: #075985;
}
💜 Supernova (Professional)
Alta performance para workloads pesados.

Recursos: 1000m CPU | 4Gi RAM | 100GB Disco

Paleta:

CSS
:root .theme-supernova {
  --theme-1: #09050f; --theme-2: #1e1b4b; --theme-3: #2e1065;
  --theme-4: #4c1d95; --theme-5: #6d28d9;
  --theme-6: #a855f7; 
  --theme-7: #faf5ff; --theme-8: #d8b4fe; --theme-9: #7e22ce;
}
🕳️ Black Hole (Ultra)
Onde a física (e o lag) deixam de existir.

Recursos: 4000m CPU | 16Gi RAM | 500GB Disco

Paleta:

CSS
:root .theme-blackhole {
  --theme-1: #000000; --theme-2: #09090b; --theme-3: #18181b;
  --theme-4: #27272a; --theme-5: #ffffff;
  --theme-6: #ffffff; 
  --theme-7: #ffffff; --theme-8: #d4d4d8; --theme-9: #52525b;
}
🛠️ Como usar no CSS
Para aplicar as cores dinamicamente em seus componentes:

CSS
.card {
  background-color: var(--theme-2);
  border: 1px solid var(--theme-4);
  color: var(--theme-8);
}

.card-title {
  color: var(--theme-7);
}

.button-primary {
  background-color: var(--theme-6);
  color: var(--theme-1);
}
