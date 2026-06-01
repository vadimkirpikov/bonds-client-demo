'use server';

import dbConnect from '@/lib/db';
import BondInteraction from '@/models/BondInteraction';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerApi } from '@/lib/server-api';
import { BondApi, AuthApi } from '@/lib/api';

export interface BondStats {
    likes: number;
    dislikes: number;
    userVote: 'LIKE' | 'DISLIKE' | null;
}

export async function getBatchBondStats(bondIds: string[]): Promise<Record<string, BondStats>> {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const counts = await BondInteraction.aggregate([
        { $match: { bondId: { $in: bondIds }, type: { $in: ['LIKE', 'DISLIKE'] } } },
        {
            $group: {
                _id: { bondId: "$bondId", type: "$type" },
                count: { $sum: 1 }
            }
        }
    ]);

    let userVotes: any[] = [];
    if (userId) {
        userVotes = await BondInteraction.find({
            bondId: { $in: bondIds },
            userId: userId,
            type: { $in: ['LIKE', 'DISLIKE'] }
        }).select('bondId type');
    }

    const result: Record<string, BondStats> = {};
    bondIds.forEach(id => {
        result[id] = { likes: 0, dislikes: 0, userVote: null };
    });

    counts.forEach((item: any) => {
        const { bondId, type } = item._id;
        if (result[bondId]) {
            if (type === 'LIKE') result[bondId].likes += item.count;
            if (type === 'DISLIKE') result[bondId].dislikes += item.count;
        }
    });

    userVotes.forEach((doc: any) => {
        if (result[doc.bondId]) {
            if (doc.type === 'LIKE' || doc.type === 'DISLIKE') {
                result[doc.bondId].userVote = doc.type;
            }
        }
    });

    return result;
}

export async function getBondStats(bondId: string): Promise<BondStats> {
    const batch = await getBatchBondStats([bondId]);
    return batch[bondId] || { likes: 0, dislikes: 0, userVote: null, isFavorite: false };
}

export async function toggleInteraction(bondId: string, type: 'LIKE' | 'DISLIKE') {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error("Unauthorized");
    }

    try {
        const existing = await BondInteraction.findOne({ bondId, userId, type: { $in: ['LIKE', 'DISLIKE'] } });

        if (existing) {
            if (existing.type === type) {
                await BondInteraction.findByIdAndDelete(existing._id);
                return { added: false, removed: true };
            } else {
                existing.type = type;
                await existing.save();
                return { added: true, swapped: true };
            }
        } else {
            await BondInteraction.create({ bondId, userId, type });
            return { added: true };
        }
    } catch (e) {
        console.error("Interaction error:", e);
        return { error: 'Failed' };
    }
}

export async function toggleFavorite(bondId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        throw new Error("Unauthorized");
    }
    const userId = session.user.id;

    try {
        const api = await getServerApi(BondApi);
        await api.apiV1BondsIdFavoritePost({ id: bondId });
    } catch (e) {
        console.error("API Favorite failed", e);
    }

    await dbConnect();

    const existing = await BondInteraction.findOne({ bondId, userId, type: 'FAVORITE' });

    if (existing) {
        await BondInteraction.findByIdAndDelete(existing._id);
        return { added: false };
    } else {
        await BondInteraction.create({ bondId, userId, type: 'FAVORITE' });
        return { added: true };
    }
}

export async function updateBondAdmin(bondId: string, payload: any) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const authApi = await getServerApi(AuthApi);
        const me = await authApi.apiV1AuthMeGet();
        if (me.role !== 'Admin') {
            return { success: false, error: 'Forbidden: Admins only' };
        }
    } catch (e) {
        console.error("Admin check failed", e);
        return { success: false, error: 'Admin check failed' };
    }

    try {
        const api = await getServerApi(BondApi);
        await api.apiV1BondsUpdateIdPut({
            id: bondId,
            adminBondUpdateRequest: payload
        });
        return { success: true };
    } catch (e: any) {
        console.error("Failed to update bond", e);

        let errorMessage = e.message || 'Ошибка сервера';

        if (e.response) {
            try {
                const errorData = await e.response.json();

                if (errorData.errors && typeof errorData.errors === 'object') {
                    const validationMessages = Object.values(errorData.errors).flat();
                    errorMessage = validationMessages.join(', ');
                } else if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
            } catch (_) {
            }
        }

        return { success: false, error: errorMessage };
    }
}