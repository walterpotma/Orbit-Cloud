import axios from "axios";
import fetch from "node-fetch";
import { Vercel } from '@vercel/sdk';

const vercel = new Vercel({
    bearerToken: "I2HuWY2G3UM72tZDAQQh2mW2",
});

export async function updateDnsRecord(domain: string, subdomain: string = "@", ip: string) {
    const records = await vercel.dns.getRecords({ domain });
    const target = (records as any).find(
        (r: any) => r.type === "A" && r.name === subdomain
    );
    if (!target) {
        throw new Error(`Registro A não encontrado para ${subdomain}.${domain}`);
    }
    if (target.value === ip) {
        return { message: "IP já está atualizado", ip };
    }

    await vercel.dns.updateRecord({
        recordId: target.id,
        requestBody: {
            name: target.name,
            value: ip,
            type: "A",
            ttl: 60,
            srv: null,
            https: null,
        },
    });
    return { message: "✅ DNS atualizado com sucesso", ip };
}