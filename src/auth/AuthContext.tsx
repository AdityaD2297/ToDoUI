import { createContext, useContext, useEffect, useState } from "react";

type AuthContextValue = {
    isAuthenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("access_token")
    );

    useEffect(() => {
        if (token) {
            localStorage.setItem("access_token", token);
        } else {
            localStorage.removeItem("access_token");
        }
    }, [token]);

    const login = (jwt: string) => {
        setToken(jwt);
    };

    const logout = () => {
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: Boolean(token),
                token,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Safe hook for consuming auth state
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
