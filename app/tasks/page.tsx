"use client"

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import 'tailwindcss/tailwind.css';

export default function Tasks() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        assignedToUserId: '',
        projectId: '',
        status: 'Not Started'
    });

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
          router.push('/login');
        }
      }, [router]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        // Here you can add your API call to submit the formData to your backend
        console.log(formData);
        setFormData({
            title: '',
            description: '',
            dueDate: '',
            assignedToUserId: '',
            projectId: '',
            status: 'Not Started'
        });
    };

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
                        <label htmlFor="assignedToUserId" className="block text-gray-700 font-semibold mb-2">ID do Usuário Atribuído</label>
                        <input
                            type="text"
                            id="assignedToUserId"
                            name="assignedToUserId"
                            value={formData.assignedToUserId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="projectId" className="block text-gray-700 font-semibold mb-2">ID do Projeto</label>
                        <input
                            type="text"
                            id="projectId"
                            name="projectId"
                            value={formData.projectId}
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
