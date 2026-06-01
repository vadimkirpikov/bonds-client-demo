'use server';

import { getServerApi } from '@/lib/server-api';
import { UserPreferencesApi } from '@/lib/api';
import type { UserCollectionResponse, MarkedIssuerListResponse, MessageResponse } from '@/lib/api';


export async function getMarkedIssuers(): Promise<MarkedIssuerListResponse> {
    try {
        const api = await getServerApi(UserPreferencesApi);
        return await api.apiV1UserPreferencesMarkedIssuersGet();
    } catch (e) {
        console.error('Failed to get marked issuers:', e);
        return { issuers: [] };
    }
}

export async function toggleMarkedIssuer(inn: string): Promise<{ success: boolean; message?: string }> {
    try {
        const api = await getServerApi(UserPreferencesApi);
        const result: MessageResponse = await api.apiV1UserPreferencesMarkedIssuersTogglePost({
            toggleMarkedIssuerRequest: { inn }
        });
        return { success: true, message: result.message || undefined };
    } catch (e) {
        console.error('Failed to toggle marked issuer:', e);
        return { success: false };
    }
}


export async function getUserCollections(): Promise<UserCollectionResponse[]> {
    try {
        const api = await getServerApi(UserPreferencesApi);
        const result = await api.apiV1UserPreferencesCollectionsGet();
        return result.collections || [];
    } catch (e) {
        console.error('Failed to get user collections:', e);
        return [];
    }
}

export async function createCollection(name: string, queryUrl: string): Promise<{ success: boolean }> {
    try {
        const api = await getServerApi(UserPreferencesApi);
        await api.apiV1UserPreferencesCollectionsPost({
            saveUserCollectionRequest: { name, queryUrl }
        });
        return { success: true };
    } catch (e) {
        console.error('Failed to create collection:', e);
        return { success: false };
    }
}

export async function updateCollection(id: string, queryUrl: string): Promise<{ success: boolean }> {
    try {
        const api = await getServerApi(UserPreferencesApi);
        await api.apiV1UserPreferencesCollectionsIdPut({
            id,
            updateUserCollectionRequest: { queryUrl }
        });
        return { success: true };
    } catch (e) {
        console.error('Failed to update collection:', e);
        return { success: false };
    }
}

export async function deleteCollection(id: string): Promise<{ success: boolean }> {
    try {
        const api = await getServerApi(UserPreferencesApi);
        await api.apiV1UserPreferencesCollectionsIdDelete({ id });
        return { success: true };
    } catch (e) {
        console.error('Failed to delete collection:', e);
        return { success: false };
    }
}


export async function updateCustomFilters(
    customFiltersOn: boolean,
    customFilters: number[]
): Promise<{ success: boolean }> {
    try {
        const api = await getServerApi(UserPreferencesApi);
        await api.apiV1UserPreferencesCustomFiltersPut({
            updateCustomFiltersRequest: {
                customFiltersOn,
                customFilters,
            }
        });
        return { success: true };
    } catch (e) {
        console.error('Failed to update custom filters:', e);
        return { success: false };
    }
}
