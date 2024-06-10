"use client";

import { api } from "@/lib/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface UserData {
  userId: string;
  username: string;
  email: string;
}

interface Task {
  assignedTo: {
    userId: string;
    username: string;
  };
  project: {
    projectId: string;
    name: string;
  };
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  __v: number;
}

interface Team {
  teamId: string;
  name: string;
}

interface UserDataWithTasks {
  user: {
    _id: string;
    email: string;
    username: string;
    tasks: Task[];
    projects: any[];
    teams: Team[];
  };
}

const possibleStatuses = ["Not Started", "In Progress", "Completed"];

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userDataWithTasks, setUserDataWithTasks] = useState<UserDataWithTasks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [updatedTasks, setUpdatedTasks] = useState<Task[]>([]);

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
      const response = await api.get<UserDataWithTasks>("api/v1/users/info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData({
        userId: response.data.user._id,
        username: response.data.user.username,
        email: response.data.user.email,
      });
      setUserDataWithTasks(response.data);
      setUpdatedTasks(response.data.user.tasks);
    } catch (error) {
      setError(error as Error);
      console.log(error);
      router.push("/logout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    setUpdatedTasks((prevTasks) =>
      prevTasks.map((task) => (task._id === taskId ? { ...task, status: newStatus } : task))
    );
  };

  const saveUpdatedTasks = async () => {
    // Aqui você pode enviar as tarefas atualizadas para o servidor
    console.log("Tarefas atualizadas:", updatedTasks);
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return null;

  return (
    <div className="flex flex-col">
      <div className="bg-gray-200 p-4 rounded-md mb-4">
        <h2 className="text-lg font-bold mb-2">Informações do Usuário</h2>
        {userData && (
          <div>
            <p>ID: {userData.userId}</p>
            <p>Nome de Usuário: {userData.username}</p>
            <p>Email: {userData.email}</p>
          </div>
        )}
      </div>

      {userDataWithTasks && userDataWithTasks.user && (
        <div className="flex flex-col space-y-4">
          <section>
            <h2 className="text-xl font-bold mb-2">Tasks:</h2>
            {updatedTasks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {updatedTasks.map((task) => (
                  <div key={task._id} className="bg-white rounded-md shadow-md p-4">
                    <h3 className="text-lg font-bold mb-2">{task.title}</h3>
                    <p>{task.description}</p>
                    <p>Assigned To: {task.assignedTo.username}</p>
                    <p>Due Date: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</p>
                    <div className="flex items-center space-x-2">
                      <label htmlFor={`status-${task._id}`} className="font-bold">
                        Status:
                      </label>
                      <select
                        id={`status-${task._id}`}
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1"
                      >
                        {possibleStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      {task.status !== updatedTasks.find((t) => t._id === task._id)?.status && (
                        <button
                          onClick={saveUpdatedTasks}
                          className="bg-green-500 text-white px-4 py-2 rounded-md"
                        >
                          Salvar
                        </button>
                      )}
                    </div>
                    <Link href={`/tasks/edit/${task._id}`}>
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2">Editar</button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p>Você não tem tarefas atribuídas.</p>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">Teams:</h2>
            {userDataWithTasks.user.teams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {userDataWithTasks.user.teams.map((team) => (
                  <div key={team.teamId} className="bg-white rounded-md shadow-md p-4">
                    <h3 className="text-lg font-bold mb-2">{team.name}</h3>
                    <Link href={`/teams/${team.teamId}/edit`}>
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2">Editar</button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p>Você não pertence a nenhuma equipe.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
