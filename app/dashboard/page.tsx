"use client";

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export default function Dashboard () {
    const router = useRouter();
    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
          router.push('/login');
        }
      }, [router]);
    
    return(
        <div>Dashboard</div>
    )
}
