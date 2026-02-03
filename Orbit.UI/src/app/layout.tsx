import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/navigation";
import { UserProvider } from "@/context/user";
import packageJson from "../../package.json";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Orbit Cloud",
    description: "Plataforma de Gerenciamento de Aplicações",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || packageJson.version;

    return (
        <html lang="pt-br">
            <UserProvider>
                <body
                    className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950`}
                >
                    <div className="w-full h-screen flex justify-between items-start overflow-hidden">

                        <Navigation />

                        <main className="flex-1 h-full relative overflow-auto custom-scroll">
                            {children}
                        </main>

                    </div>

                    <div className="fixed bottom-4 right-4 z-50 pointer-events-none select-none">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm shadow-lg">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                Orbit OS <span className="text-zinc-300 font-bold">v{appVersion}</span>
                            </span>
                        </div>
                    </div>

                </body>
            </UserProvider>
        </html>
    );
}