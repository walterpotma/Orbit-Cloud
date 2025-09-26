import express, { Request, Response } from "express";
import fetch from "node-fetch";
import { IpAddress } from "../models/ip";


export async function getExternalIp(): Promise<IpAddress> {
    try {
        const ipv4Promise = fetch("https://api.ipify.org?format=text");
        const ipv6Promise = fetch("https://api64.ipify.org?format=text");

        const [ipv4Response, ipv6Response] = await Promise.all([ipv4Promise, ipv6Promise]);

        if (!ipv4Response.ok || !ipv6Response.ok) {
            throw new Error('Falha ao contatar os serviços de IP. Status: ' +
                `IPv4-${ipv4Response.status}, IPv6-${ipv6Response.status}`);
        }

        const ipv4TextPromise = ipv4Response.text();
        const ipv6TextPromise = ipv6Response.text();

        const [ipv4, ipv6] = await Promise.all([ipv4TextPromise, ipv6TextPromise]);

        return { ipv4, ipv6 };

    } catch (error: any) {
        console.error("Erro no serviço ao buscar IP externo:", error.message);
        throw new Error("Falha ao obter o endereço de IP externo.");
    }
}