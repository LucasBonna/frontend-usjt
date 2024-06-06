"use client"

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-5xl font-bold mb-6">Bem-vindo ao Todo App</h1>
      <p className="text-2xl mb-12 text-center">Organize suas tarefas de forma fácil e eficiente.</p>
      <button onClick={handleLogin} className="px-8 py-4 text-lg font-semibold text-white bg-blue-500 rounded hover:bg-blue-700 transition duration-300">
        Começar
      </button>
    </div>
  );
}
