"use client"
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface User {
    id: string;
    name: string;
    email: string;
}

interface Member {
    id: string;
    name: string;
    selected: boolean;
    removable: boolean;
}

export default function CreateTeams() {
    const router = useRouter();
    const [teamName, setTeamName] = useState<string>('');
    const [members, setMembers] = useState<Member[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [adminUser, setAdminUser] = useState<User | null>(null);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login');
        }

        const fetchUserInfo = async () => {
            try {
                if (token) {
                    const response = await api.get('/api/v1/users/info', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const adminUserData = {
                        id: response.data.user._id,
                        name: response.data.user.username,
                        email: response.data.user.email,
                    };
                    setAdminUser(adminUserData);
                    setMembers([{ id: adminUserData.id, name: adminUserData.name, selected: true, removable: false }]);
                }
            } catch (error) {
                console.error('Erro ao buscar informações do usuário:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                if (token) {
                    const response = await api.get('/api/v1/users', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const usersData: User[] = response.data.users.map((user: any) => ({
                        id: user._id,
                        name: user.username,
                        email: user.email,
                    }));
                    setUsers(usersData);
                    setAvailableUsers(usersData.filter((user) => !members.some((member) => member.id === user.id)));
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
            }
        };

        fetchUserInfo();
        fetchUsers();
    }, [router]);

    const handleAddMember = () => {
        setMembers([...members, { id: '', name: '', selected: false, removable: true }]);
    };

    const handleMemberChange = (index: number, user: User) => {
        const newMembers = [...members];
        newMembers[index] = { id: user.id, name: user.name, selected: true, removable: true };
        setMembers(newMembers);
        setAvailableUsers(availableUsers.filter((u) => u.id !== user.id));
    };

    const handleRemoveMember = (index: number) => {
        if (members[index].removable) {
            const newMembers = members.filter((_, i) => i !== index);
            setMembers(newMembers);
            setAvailableUsers([...availableUsers, users.find((u) => u.id === members[index].id)!]);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const token = Cookies.get('token');

        if (token) {
            const payload = {
                name: teamName,
                adminId: adminUser?.id || '',
                members: members.map((member) => ({
                    memberId: member.id,
                    memberName: member.name,
                })),
            };

            try {
                await api.post('/api/v1/teams/createTeam', payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                alert('Team created successfully!');
                router.push('/dashboard');
            } catch (error) {
                console.error('Error creating team:', error);
                alert('Error creating team. Please try again.');
            }
        } else {
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Create Teams</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="teamName">Team Name</label>
                        <input
                            className="w-full px-3 py-2 border rounded"
                            type="text"
                            id="teamName"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            required
                        />
                    </div>
                    {members.map((member, index) => (
                        <div key={index} className="mb-4">
                            <label className="block text-gray-700 mb-2">Member {index + 1}</label>
                            <div className="flex space-x-2 mb-2">
                                {!member.selected && (
                                    <select
                                        className="w-1/2 px-3 py-2 border rounded"
                                        value={member.id}
                                        onChange={(e) => handleMemberChange(index, users.find((u) => u.id === e.target.value)!)}
                                        required
                                    >
                                        <option value="">Select User</option>
                                        {availableUsers.map((user: User) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <input
                                    className="w-1/2 px-3 py-2 border rounded"
                                    type="text"
                                    placeholder="Member Name"
                                    value={member.name}
                                    disabled
                                />
                                {member.removable && (
                                    <button
                                        type="button"
                                        className="px-3 py-2 border rounded bg-red-500 text-white"
                                        onClick={() => handleRemoveMember(index)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <div className="mb-4">
                        <button
                            type="button"
                            className="w-full px-3 py-2 border rounded bg-blue-500 text-white"
                            onClick={handleAddMember}
                        >
                            Add Member
                        </button>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full px-3 py-2 border rounded bg-green-500 text-white"
                        >
                            Create Team
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
