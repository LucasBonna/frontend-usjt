'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

interface TeamInfo {
  _id: string;
  name: string;
  members: {
    userId: string;
    username: string;
    _id: string;
  }[];
  adminId: string;
  projects: any[];
  tasks: any[];
};

interface User {
  _id: string;
  username: string;
}

export default function EditTeam() {
  const router = useRouter();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const [users, setUsers] = useState<User[]>([]);
  const teamId = pathname.split('/')[3];
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const fetchTeamInfo = async () => {
      try {
        const response = await api.get(`/api/v1/teams/info/${teamId}`, {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        });
        console.log('Team Info:', response.data);
        setTeamInfo(response.data.team);
      } catch (error) {
        console.error('Erro ao buscar as informações do time:', error);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchTeamInfo();
    }
  }, [teamId]);

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

  const handleRemoveMember = (memberId: string) => {
    if (teamInfo) {
      setTeamInfo({
        ...teamInfo,
        members: teamInfo.members.filter((member) => member._id !== memberId),
      });
    }
  };

  const handleAddMember = (userId: string) => {
    if (teamInfo) {
      const newMember = users.find((user) => user._id === userId);
      if (newMember) {
        setTeamInfo({
          ...teamInfo,
          members: [
            ...teamInfo.members,
            { userId: newMember._id, username: newMember.username, _id: '' },
          ],
        });
      }
    }
  };

  const handleSaveTeam = async () => {
    try {
      if (teamInfo) {
        const response = await api.put(`/api/v1/teams/${teamId}`, {
          name: newTeamName || teamInfo.name,
          members: teamInfo.members.map((member) => ({
            userId: member.userId,
            username: member.username,
          })),
        }, {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        });
        console.log('Time atualizado:', response.data);
        alert('Time atualizado com sucesso!');
        router.push('/dashboard'); // Redirecionar para o dashboard
      } else {
        console.error('Time não encontrado');
      }
    } catch (error) {
      console.error('Erro ao atualizar o time:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (!teamInfo) {
    return <div className="flex justify-center items-center h-screen">Time não encontrado</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Editar Time</h1>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Nome:</label>
        <input
          type="text"
          value={newTeamName || teamInfo.name}
          onChange={(e) => setNewTeamName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <p className="mb-4">Administrador: {teamInfo.adminId}</p>
      <h2 className="text-2xl font-bold mb-4">Membros:</h2>
      <ul className="mb-6">
        {teamInfo.members.map((member) => (
          <li key={member._id} className="flex items-center justify-between mb-2">
            <span>{member.username} ({member.userId})</span>
            <div className="flex items-center">
              <button
                onClick={() => handleRemoveMember(member._id)}
                className="bg-red-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-red-600 transition-colors duration-300"
              >
                Remover
              </button>
              <select
                onChange={(e) => handleAddMember(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Adicionar membro</option>
                {users
                  .filter((user) => !teamInfo.members.some((member) => member.userId === user._id))
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.username}
                    </option>
                  ))}
              </select>
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={handleSaveTeam}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300"
      >
        Salvar
      </button>
    </div>
  );
}