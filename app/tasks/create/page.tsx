"use client"

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import 'tailwindcss/tailwind.css';
import { api } from '@/lib/api';

interface User {
    _id: string;
    email: string;
    username: string;
    password: string;
    isAdmin: boolean;
    __v: number;
}

export default function CreateTasks() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        teamId: '',
        status: 'Not Started'
    });
    const [users, setUsers] = useState<User[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<{ userId: string, username: string }[]>([]);

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

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const token = Cookies.get('token');
            if (token) {
                const response = await api.post('/api/v1/tasks/create', {
                    title: formData.title,
                    description: formData.description,
                    dueDate: formData.dueDate,
                    assignedTo: selectedMembers,
                    teamId: formData.teamId,
                    status: formData.status
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                alert('Task criada com sucesso!');
                router.push('/dashboard');
            } else {
                router.push('/login');
            }
        } catch (error) {
            console.error('Erro ao criar task:', error);
        }
    };

    const availableUsers = users.filter((user) => !selectedMembers.some((member) => member.userId === user._id));

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Pagina de Tasks</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">Título</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">Descrição</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="dueDate" className="block text-gray-700 font-semibold mb-2">Data de Vencimento</label>
                        <input
                            type="date"
                            id="dueDate"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Membros Atribuídos</label>
                        <div className="flex items-center">
                            <select
                                id="assignedToUserId"
                                name="assignedToUserId"
                                value=""
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const selectedUser = users.find((user) => user._id === e.target.value);
                                        if (selectedUser) {
                                            setSelectedMembers([...selectedMembers, { userId: selectedUser._id, username: selectedUser.username }]);
                                        }
                                    }
                                }}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                            >
                                <option value="">Selecione um usuário</option>
                                {availableUsers.map((user) => (
                                    <option key={user._id} value={user._id}>{user.username}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setSelectedMembers([])}
                                className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                Limpar
                            </button>
                        </div>
                        <div className="mt-2">
                            {selectedMembers.map((member) => (
                                <span
                                    key={member.userId}
                                    className="bg-gray-200 text-gray-800 py-1 px-2 rounded-full inline-flex items-center mr-2 mb-2"
                                >
                                    {member.username}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMembers(selectedMembers.filter((m) => m.userId !== member.userId))}
                                        className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="teamId" className="block text-gray-700 font-semibold mb-2">ID do Time</label>
                        <input
                            type="text"
                            id="teamId"
                            name="teamId"
                            value={formData.teamId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="status" className="block text-gray-700 font-semibold mb-2">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Enviar</button>
                </form>
            </div>
        </div>
    );
}
