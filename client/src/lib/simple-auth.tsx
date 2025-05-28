import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: number;
  nombre: string;
  email: string;
  tipoUsuario: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({
    id: 1,
    nombre: "Usuario Demo",
    email: "demo@agde.es",
    tipoUsuario: "propietario"
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulación de login simple
    setUser({
      id: 1,
      nombre: "Usuario Demo",
      email,
      tipoUsuario: "propietario"
    });
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a SimpleAuthProvider");
  }
  return context;
}

export default SimpleAuthProvider;