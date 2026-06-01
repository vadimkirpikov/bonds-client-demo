'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Edit } from 'lucide-react';
import { AuthApi } from '@/lib/api';
import { getClientApi } from '@/lib/client-api';

export const EditBrandButton = ({ brandId }: { brandId: string }) => {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {

            try {
                const api = getClientApi(AuthApi);
                const response = await api.apiV1AuthMeGet();

                if (response.role?.toLowerCase() === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Admin check failed for Edit button", error);
                setIsAdmin(false);
            }
        };

        checkAuth();
    }, []);

    if (!isAdmin) return null;

    return (
        <Link href={`/admin/brands/${brandId}`}>
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                <Edit size={16} className="mr-2" />
                Редактировать эмитента
            </Button>
        </Link>
    );
};