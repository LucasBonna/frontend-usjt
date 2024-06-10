'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  assignedTo: {
    userId: string;
    username: string;
  }[];
  teamId: string;
  status: string;
  __v: number;
}

interface User {
  _id: string;
  username: string;
}

export default function EditTask() {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const pathname = usePathname();
  const taskId = pathname.split('/')[3];

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/api/v1/tasks/${taskId}`, {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        });
        setTask(response.data.task);
      } catch (error) {
        console.error('Erro ao buscar a tarefa:', error);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = Cookies.get('token');
        if (token) {
          const response = await api.get('/api/v1/users', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUsers(response.data.users as User[]);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };

    fetchUsers();
  }, [router]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.put(
        `/api/v1/tasks/update-status/${task?._id}`, // Usar o ID da tarefa atual
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        }
      );
  
      // Crie um novo objeto updatedTask com todas as propriedades obrigatórias
      const updatedTask: Task = {
        _id: task?._id || '', // Use o valor existente em task ou uma string vazia
        title: task?.title || '', // Use o valor existente em task ou uma string vazia
        description: task?.description || '', // Use o valor existente em task ou uma string vazia
        dueDate: task?.dueDate || '', // Use o valor existente em task ou uma string vazia
        assignedTo: task?.assignedTo || [], // Use o valor existente em task ou um array vazio
        teamId: task?.teamId || '', // Use o valor existente em task ou uma string vazia
        status: newStatus, // Use o novo status
        __v: task?.__v || 0, // Use o valor existente em task ou 0
      };
  
      setTask(updatedTask);
    } catch (error) {
      console.error('Erro ao atualizar o status da tarefa:', error);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!task) {
    return <div>Tarefa não encontrada</div>;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const updatedTask = {
        ...task,
        assignedTo: task.assignedTo.map(({ userId, username }) => ({ userId, username })),
      };
      await api.put(`/api/v1/tasks/edit/${taskId}`, updatedTask, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      alert('Tarefa atualizada com sucesso!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao atualizar a tarefa:', error);
    }
  };

  const handleAddUser = (user: User) => {
    setTask({
      ...task,
      assignedTo: [...task.assignedTo, { userId: user._id, username: user.username }],
    });
  };

  const handleRemoveUser = (userId: string) => {
    setTask({
      ...task,
      assignedTo: task.assignedTo.filter((member) => member.userId !== userId),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Título:</label>
        <input
          type="text"
          id="title"
          value={task.title}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="description">Descrição:</label>
        <textarea
          id="description"
          value={task.description}
          onChange={(e) => setTask({ ...task, description: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="dueDate">Data de Vencimento:</label>
        <input
          type="date"
          id="dueDate"
          value={task.dueDate}
          onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="status">Status:</label>
        <select
          id="status"
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="Not Started">Não Iniciada</option>
          <option value="In Progress">Em Progresso</option>
          <option value="Completed">Concluída</option>
        </select>
      </div>
      <div>
        <label>Membros Atribuídos:</label>
        {task.assignedTo.map((member) => (
          <div key={member.userId}>
            <select
              value={member.username}
              onChange={(e) =>
                setTask({
                  ...task,
                  assignedTo: task.assignedTo.map((m) =>
                    m.userId === member.userId ? { ...m, username: e.target.value } : m
                  ),
                })
              }
            >
              <option value={member.username}>{member.username}</option>
              {users
                .filter((user) => user.username !== member.username)
                .map((user) => (
                  <option key={user._id} value={user.username}>
                    {user.username}
                  </option>
                ))}
            </select>
            <button type="button" onClick={() => handleRemoveUser(member.userId)}>
              Remover
            </button>
          </div>
        ))}
        <div>
          <select
            onChange={(e) => handleAddUser(users.find((user) => user.username === e.target.value) || { _id: '', username: '' })}
          >
            <option value="">Adicionar Membro</option>
            {users
              .filter((user) => !task.assignedTo.some((member) => member.userId === user._id))
              .map((user) => (
                <option key={user._id} value={user.username}>
                  {user.username}
                </option>
              ))}
          </select>
        </div>
      </div>
      <button type="submit">Salvar</button>
    </form>
  );
}
