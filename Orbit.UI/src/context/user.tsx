"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { VARIABLE_API_URL } from "@/types/variables";
import axios from "axios";
import { Github } from "@/api/github";
import { useRouter } from "next/navigation";


interface User {
    githubID: string;
    username: string;
    email: string;
    githubLogin: string;
    avatar: string;
    name: string;
    authenticationToken: string;
}

interface UserContextType {
    UserData: User | null;
    isLoading: boolean;
    logout: () => void;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [UserData, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function loadUser() {
            try {
                const response = await Github.Me();
                setUser(response.data);
                console.log("Dados brutos do usuário:", response);
                console.log("Usuário logado:", response.data);
            } catch (error) {
                console.log("Usuário não logado");
                setUser(null);
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        }

        loadUser();
    }, []);

    function logout() {
        setUser(null);
        window.location.href = "/login";
    }

    return (
        <UserContext.Provider value={{ UserData, isLoading, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);