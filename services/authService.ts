import { User, UserRole, Transportadora } from '../types';
import { MOCK_USERS, MOCK_CARRIERS } from './mockData';

// In a real app, this would hit the Laravel /api/login endpoint
// and return a JWT token.

export const login = async (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email === email);
      
      // Simulating simple password check (in real app, use bcrypt verify on backend)
      // Allow admin login for demo: admin@sistema.com.br / 123456
      if (user && password === '123456') {
        resolve({
            ...user,
            token: 'fake-jwt-token-xyz-123'
        });
      } else {
        reject(new Error('Credenciais inválidas.'));
      }
    }, 800);
  });
};

export const logout = async (): Promise<void> => {
  return new Promise((resolve) => {
      setTimeout(() => resolve(), 300);
  });
};

// --- ADMIN USER SERVICES ---

export const getAllUsers = async (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...MOCK_USERS]), 500);
  });
};

export const updateUserConfig = async (userId: string, updates: Partial<User>): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const idx = MOCK_USERS.findIndex(u => u.id === userId);
      if (idx !== -1) {
        MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...updates };
        resolve(MOCK_USERS[idx]);
      }
    }, 500);
  });
};

// --- CARRIER (TRANSPORTADORA) SERVICES ---

export const getAllCarriers = async (): Promise<Transportadora[]> => {
   // SQL: SELECT * FROM carriers ORDER BY name ASC;
   return new Promise((resolve) => {
    setTimeout(() => resolve([...MOCK_CARRIERS]), 500);
   });
};

export const createCarrier = async (data: Omit<Transportadora, 'id'>): Promise<Transportadora> => {
  // SQL: INSERT INTO carriers (id, name, cnpj) VALUES (uuid_generate_v4(), $1, $2) RETURNING *;
  return new Promise((resolve) => {
    setTimeout(() => {
      const newCarrier: Transportadora = {
        id: 't' + Math.random().toString(36).substr(2, 9),
        ...data
      };
      MOCK_CARRIERS.push(newCarrier);
      resolve(newCarrier);
    }, 500);
  });
};

export const updateCarrier = async (id: string, data: Partial<Transportadora>): Promise<Transportadora> => {
  // SQL: UPDATE carriers SET name = COALESCE($2, name), cnpj = COALESCE($3, cnpj) WHERE id = $1 RETURNING *;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const idx = MOCK_CARRIERS.findIndex(c => c.id === id);
      if (idx !== -1) {
        MOCK_CARRIERS[idx] = { ...MOCK_CARRIERS[idx], ...data };
        resolve(MOCK_CARRIERS[idx]);
      } else {
        reject(new Error("Transportadora não encontrada"));
      }
    }, 500);
  });
};

export const deleteCarrier = async (id: string): Promise<void> => {
  // SQL: DELETE FROM carriers WHERE id = $1;
  return new Promise((resolve) => {
    setTimeout(() => {
      const idx = MOCK_CARRIERS.findIndex(c => c.id === id);
      if (idx > -1) {
        MOCK_CARRIERS.splice(idx, 1);
      }
      resolve();
    }, 500);
  });
};