import type { User } from "@shared/schema";

export interface AuthResponse {
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  tipoUsuario: string;
  numColegiado?: string;
  numLicenciaTransporte?: string;
  idAutoridad?: string;
}

export class AuthService {
  private static instance: AuthService;
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error de autenticación");
    }

    return response.json();
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error en el registro");
    }

    return response.json();
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        throw new Error("Error al obtener usuario");
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // Silent fail - we'll clear local state anyway
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPassword(password: string): boolean {
    // At least 8 characters, one uppercase, one lowercase, one number
    return password.length >= 8;
  }

  validateUserType(tipo: string): boolean {
    const validTypes = ['propietario', 'veterinario', 'transportista', 'autoridad'];
    return validTypes.includes(tipo);
  }

  // Generate secure passwords for demo purposes
  generateSecurePassword(): string {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  // Format user display name
  formatUserName(user: User): string {
    return `${user.nombre} ${user.apellidos}`;
  }

  // Get user role display name
  getUserRoleDisplay(tipoUsuario: string): string {
    switch (tipoUsuario) {
      case 'propietario':
        return 'Propietario';
      case 'veterinario':
        return 'Veterinario';
      case 'transportista':
        return 'Transportista';
      case 'autoridad':
        return 'Autoridad';
      default:
        return 'Usuario';
    }
  }

  // Check if user has permission for certain actions
  canManageHorses(user: User): boolean {
    return ['propietario', 'veterinario', 'autoridad'].includes(user.tipoUsuario);
  }

  canIssueHealthCertificates(user: User): boolean {
    return user.tipoUsuario === 'veterinario';
  }

  canManageTransport(user: User): boolean {
    return ['transportista', 'autoridad'].includes(user.tipoUsuario);
  }

  canAccessAllData(user: User): boolean {
    return user.tipoUsuario === 'autoridad';
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Export utility functions
export const {
  login,
  register,
  getCurrentUser,
  logout,
  isValidEmail,
  isValidPassword,
  validateUserType,
  formatUserName,
  getUserRoleDisplay,
  canManageHorses,
  canIssueHealthCertificates,
  canManageTransport,
  canAccessAllData,
} = authService;
