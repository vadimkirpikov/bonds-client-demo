"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Cookies from "js-cookie";

export default function CookieSync() {
    const { data: session } = useSession();

    useEffect(() => {
        const isDev = process.env.NEXT_PUBLIC_API_URL !== process.env.NEXT_PUBLIC_SERVER_URL;
        const token = (session as any)?.accessToken;

        const cookieOptions: Cookies.CookieAttributes = {
            path: "/",
        };

        if (isDev) {
            cookieOptions.secure = false;
            cookieOptions.sameSite = "lax";
        } else {
            cookieOptions.secure = true;
            cookieOptions.sameSite = "none";
            cookieOptions.domain = ".bonds-lab.ru";
        }

        if (token) {
            cookieOptions.expires = 7;
            Cookies.set("accessToken", token, cookieOptions);
            console.log("Token synced to cookies!");
        } else if (session === null) {
            Cookies.remove("accessToken", cookieOptions);
            console.log("Token removed from cookies!");
        }
    }, [session]);

    return null;
}