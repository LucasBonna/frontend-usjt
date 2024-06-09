"use client"

import Cookies from "js-cookie"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Logout(){
    const token = Cookies.get('token');
    const router = useRouter();

    useEffect(() => {
        if (token) {
            Cookies.remove('token');
        }

        router.push('/login');
    })
}