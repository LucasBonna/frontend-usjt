import axios from "axios";

export const api = axios.create({
    baseURL: 'http://localhost:3005',
});

export const loginUser = async ({ email, password }: { email: string; password: string }) => {
    try {
      const response = await api.post('/login', { email, password });
      return response.data.accessToken;
    } catch (error) {
      throw new Error('Erro ao fazer login');
    }
  };