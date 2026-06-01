"use client";
import Image from "next/image"
import { useState } from "react"

export function Logo({ logoSrc, title = "IMG" }: { logoSrc?: string; title?: string }) {
    const [error, setError] = useState(false)

    if (error || !logoSrc) {
        return (
            <div className="
        w-full h-full flex items-center justify-center
        rounded-full bg-linear-to-br
        from-gray-700 to-gray-900
        text-white text-sm font-semibold
      ">
                {title[0]}
            </div>
        )
    }

    return (
        <Image
            width={48}
            height={48}
            alt={title}
            src={logoSrc}
            className="w-full h-full object-cover rounded-full"
            onError={() => setError(true)}
            unoptimized
        />
    )
}
