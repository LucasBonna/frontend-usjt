"use client";

import { api } from "@/lib/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";

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
  _id: string;
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 100%;
`;

const UserInfo = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin: 10px 0;

  &:hover {
    background-color: #0056b3;
  }
`;

const SectionsContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  gap: 20px;
`;

const Section = styled.section`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 45%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const DashboardBox = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 20px;
  width: 90%;
  max-width: 1200px;
`;

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

  const handleDeleteTask = async (taskId: string) => {
    const token = Cookies.get("token");
    if (token) {
      try {
        await api.delete(`/api/v1/tasks/delete/${taskId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUpdatedTasks(updatedTasks.filter((task) => task._id !== taskId));
      } catch (error) {
        console.error("Erro ao excluir tarefa:", error);
      }
    } else {
      router.push("/login");
    }
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return null;

  return (
    <Container>
      <Header>
        <UserInfo>
          <h2 className="text-lg font-bold mb-2">Informações do Usuário</h2>
          {userData && (
            <div>
              <p>ID: {userData.userId}</p>
              <p>Nome de Usuário: {userData.username}</p>
              <p>Email: {userData.email}</p>
            </div>
          )}
        </UserInfo>
      </Header>
      <DashboardBox>
        <Title>Dashboard</Title>
        {userDataWithTasks && userDataWithTasks.user && (
          <SectionsContainer>
            <Section>
              <SectionHeader>
                <h2 className="text-xl font-bold">Tasks</h2>
                <Button onClick={() => router.push('/tasks/create')}>Criar Tarefa</Button>
              </SectionHeader>
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
                      <div className="flex justify-between mt-2">
                        <Link href={`/tasks/edit/${task._id}`}>
                          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Editar</button>
                        </Link>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-md"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Você não tem tarefas atribuídas.</p>
              )}
            </Section>

            <Section>
              <SectionHeader>
                <h2 className="text-xl font-bold">Teams</h2>
                <Button onClick={() => router.push('/teams/create')}>Criar Time</Button>
              </SectionHeader>
              {userDataWithTasks.user.teams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userDataWithTasks.user.teams.map((team) => (
                    <div key={team.teamId} className="bg-white rounded-md shadow-md p-4">
                      <h3 className="text-lg font-bold mb-2">{team.name}</h3>
                      <Link href={`/teams/edit/${team._id}`}>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2">Editar</button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Você não pertence a nenhuma equipe.</p>
              )}
            </Section>
          </SectionsContainer>
        )}
      </DashboardBox>
    </Container>
  );
}
