"use client";

import { api } from "@/lib/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserData {
  name: string;
  email: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
    } else {
      fetchUserInfo(token);
    }
  }, [router]);

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await api.get<UserData>("api/v1/users/info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(response.data);
    } catch (error) {
      setError(error as Error);
      console.log(error);
      // router.push("/logout");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return null;

  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        <h2>Informações do Usuário</h2>
        {userData && (
          <pre>{JSON.stringify(userData, null, 2)}</pre>
        )}
      </div>
      {/* Adicione outros componentes e conteúdo do dashboard aqui */}
    </div>
  );
}
