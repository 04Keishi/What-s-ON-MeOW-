import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Demo authentication (client-side only).
 *
 * This provides a realistic auth *shape* — session, protected routes, logout —
 * without a backend. It is NOT real security: the credential check runs in the
 * browser and the session flag lives in localStorage, so it can be bypassed.
 * The app only ever shows simulated (non-sensitive) data. See SECURITY.md.
 */

interface AuthUser {
    username: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => { ok: boolean; error?: string };
    logout: () => void;
}

const STORAGE_KEY = "meow-auth";

// Demo credentials — intentionally public for the hackathon demo (see SECURITY.md).
export const DEMO_CREDENTIALS = { username: "meowner", password: "meow123" };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Load a persisted session, treating storage as untrusted. */
function loadUser(): AuthUser | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.username === "string") {
            return { username: parsed.username };
        }
        return null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(loadUser);

    const login = (username: string, password: string) => {
        const u = username.trim();
        if (u === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
            const authed = { username: u };
            setUser(authed);
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(authed));
            } catch {
                // Storage unavailable — session simply won't persist across reloads.
            }
            return { ok: true };
        }
        return { ok: false, error: "Invalid username or password." };
    };

    const logout = () => {
        setUser(null);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // Ignore storage errors on logout.
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
