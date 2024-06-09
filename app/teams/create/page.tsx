"use client"
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface Member {
    id: string;
    name: string;
}

export default function CreateTeams() {
    const router = useRouter();
    const [teamName, setTeamName] = useState<string>('');
    const [members, setMembers] = useState<Member[]>([{ id: '', name: '' }]);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    const handleAddMember = () => {
        setMembers([...members, { id: '', name: '' }]);
    };

    const handleMemberChange = (index: number, field: keyof Member, value: string) => {
        const newMembers = members.map((member, i) => (
            i === index ? { ...member, [field]: value } : member
        ));
        setMembers(newMembers);
    };

    const handleRemoveMember = (index: number) => {
        const newMembers = members.filter((_, i) => i !== index);
        setMembers(newMembers);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log({ teamName, members });
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
                                <input
                                    className="w-1/2 px-3 py-2 border rounded"
                                    type="text"
                                    placeholder="Member Id"
                                    value={member.id}
                                    onChange={(e) => handleMemberChange(index, 'id', e.target.value)}
                                    required
                                />
                                <input
                                    className="w-1/2 px-3 py-2 border rounded"
                                    type="text"
                                    placeholder="Member Name"
                                    value={member.name}
                                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                                    required
                                />
                                {index > 0 && (
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
