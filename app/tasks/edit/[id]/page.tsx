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
        const response = await api.get(/api/v1/tasks/${taskId}, {
          headers: {
            Authorization: Bearer ${Cookies.get('token')},
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
              Authorization: Bearer ${token},
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-2xl font-bold text-gray-800">Tarefa não encontrada</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const updatedTask = {
        ...task,
        assignedTo: task.assignedTo.map(({ userId, username }) => ({ userId, username })),
      };
      await api.put(/api/v1/tasks/edit/${taskId}, updatedTask, {
        headers: {
          Authorization: Bearer ${Cookies.get('token')},
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
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Editar Tarefa</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Título
          </label>
          <input
            type="text"
            id="title"
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            id="description"
            value={task.description}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows={4}
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
            Data de Vencimento
          </label>
          <input
            type="date"
            id="dueDate"
            value={task.dueDate}
            onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={task.status}
            onChange={(e) => setTask({ ...task, status: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="Not Started">Não Iniciada</option>
            <option value="In Progress">Em Progresso</option>
            <option value="Completed">Concluída</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Membros Atribuídos</label>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {task.assignedTo.map((member) => (
              <div key={member.userId} className="flex items-center">
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                <button
                  type="button"
                  onClick={() => handleRemoveUser(member.userId)}
                  className="ml-2 inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <select
              onChange={(e) =>
                handleAddUser(users.find((user) => user.username === e.target.value) || { _id: '', username: '' })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}