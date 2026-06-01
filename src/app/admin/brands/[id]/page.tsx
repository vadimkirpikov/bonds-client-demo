import { EditBrandClient } from '@/components/admin/brands/EditBrandClient';
import {Metadata} from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    return {
        title: `Редактирование эмитента | Bonds-Lab Admin`,
    };
}

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <EditBrandClient id={id} />
        </div>
    );
}