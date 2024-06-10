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
}

export default function EditTeam() {
  const router = useRouter();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const teamId = pathname.split('/')[2];

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
        setTeamInfo(response.data.teamInfo);
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

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!teamInfo) {
    return <div>Time não encontrado</div>;
  }

  return (
    <div>
      <h1>Editar Time</h1>
      <p>Nome: {teamInfo.name}</p>
      <p>Administrador: {teamInfo.adminId}</p>
      <h2>Membros:</h2>
      <ul>
        {teamInfo.members.map((member) => (
          <li key={member._id}>
            {member.username} ({member.userId})
          </li>
        ))}
      </ul>
      {/* Adicione aqui os campos para editar as informações do time */}
    </div>
  );
}
