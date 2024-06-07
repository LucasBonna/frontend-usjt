"use client"
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation';

export default function Teams() {
    const router = useRouter();
    
    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
          router.push('/login');
        }
      }, [router]);
    
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Teams</h1>
            </div>
        </div>
    );
}
