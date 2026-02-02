import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface User {
    username: string;
    email?: string;
    full_name?: string;
    created_at?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    signup: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async (accessToken: string) => {
        try {
            const res = await fetch("http://localhost:8000/auth/me", {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (res.ok) {
                const profile = await res.json();
                setUser(profile);
                localStorage.setItem("user", JSON.stringify(profile));
            }
        } catch (e) {
            console.error("Failed to fetch profile", e);
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken) {
            setToken(storedToken);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
                // Refresh profile in background
                fetchProfile(storedToken);
            } else {
                fetchProfile(storedToken);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Login failed");
            }

            const data = await response.json();
            const accessToken = data.access_token;

            localStorage.setItem("token", accessToken);
            setToken(accessToken);

            // Fetch full profile immediately
            await fetchProfile(accessToken);

            toast.success("Welcome back!");
        } catch (error: any) {
            toast.error(error.message);
            throw error;
        }
    };

    const signup = async (username: string, password: string) => {
        try {
            const response = await fetch("http://localhost:8000/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Signup failed");
            }

            toast.success("Account created! Please login.");
        } catch (error: any) {
            toast.error(error.message);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        toast.info("Logged out successfully");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
