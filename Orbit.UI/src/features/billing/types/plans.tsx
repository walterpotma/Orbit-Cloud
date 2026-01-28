export interface cardProps {
    name: string;
    price: number;
    resources: resourcesProps[];
}
type resourcesProps = {
    ram: number;
    cpu: number;
    disk: number;
    description: string;
}

export const standardPlans = [
    {
        name: 'Nano',
        price: 24.90,
        featured: false,
        slug: 'nano',
        resources: [
            {
                ram: 0.256,       // em Mi
                cpu: 0.250,       // em mCores
                disk: 20,       // em GB
                description: 'Ideal para Portfólios e Sites de 1 página',
            }
        ]
    },
    {
        name: 'Starter',
        price: 34.90,
        featured: false,
        slug: 'starter',
        resources: [
            {
                ram: 0.384,
                cpu: 0.350,
                disk: 35,
                description: 'Ideal para Blogs em início de crescimento',
            }
        ]
    },
    {
        name: 'Básico',
        price: 44.90,
        featured: false,
        slug: 'basico',
        resources: [
            {
                ram: 0.512,
                cpu: 0.500,
                disk: 50,
                description: 'Ideal para Pequeno E-commerce e PMEs',
            }
        ]
    },
    {
        name: 'Pro',
        price: 99.90,
        featured: true,
        slug: 'pro',
        resources: [
            {
                ram: 1.536,    // 1.5 GB
                cpu: 1.500,    // 1.5 vCore
                disk: 100,
                description: 'Ideal para Agências e Lojas com tráfego',
            }
        ]
    },
    {
        name: 'Business',
        price: 229.90,
        featured: false,
        slug: 'business',
        resources: [
            {
                ram: 4.096,   // 4 GB
                cpu: 3.000,   // 3 vCores
                disk: 250,
                description: 'Ideal para E-commerce estabelecido',
            }
        ]
    },
    {
        name: 'Enterprise',
        price: 399.90,
        featured: false,
        slug: 'enterprise',
        resources: [
            {
                ram: 8.192,
                cpu: 4.000,
                disk: 500,
                description: 'Ideal para Missão Crítica e Alta Performance',
            }
        ]
    }
];

export const customPlan = {
    name: 'Personalizado',
    price: 0,
    featured: false,
    slug: 'custom',
    resources: [{
        ram: 0.128,
        cpu: 0.100,
        disk: 1,
        description: 'Monte um ambiente com os recursos exatos que sua aplicação precisa. Perfeito para APIs, bancos de dados e projetos específicos.'
    }],
};
const customPices = {
    ram: 7,
    cpu: 10,
    disk: 1.5
}