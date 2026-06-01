'use server';

import dbConnect from '@/lib/db';
import SystemConfig from '@/models/SystemConfig';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const KEY_RATE_CONFIG_KEY = 'key_rate';
const DEFAULT_KEY_RATE = 15;

const MAINTENANCE_MODE_CONFIG_KEY = 'maintenance_mode';
const SHOW_OFZ_CURVE_CONFIG_KEY = 'show_ofz_curve';
const PAYMENT_MAINTENANCE_CONFIG_KEY = 'payment_maintenance_config';

async function verifyAdminServer() {
    const session = await getServerSession(authOptions);
    return session?.user?.role?.toLowerCase() === 'admin';
}


export async function getKeyRate(): Promise<number> {
    await dbConnect();
    const config = await SystemConfig.findOne({ key: KEY_RATE_CONFIG_KEY });
    return config ? Number(config.value) : DEFAULT_KEY_RATE;
}

export async function updateKeyRate(rate: number) {
    const isAdmin = await verifyAdminServer();
    if (!isAdmin) {
        throw new Error('Unauthorized');
    }

    await dbConnect();
    await SystemConfig.findOneAndUpdate(
        { key: KEY_RATE_CONFIG_KEY },
        { value: rate },
        { upsert: true, new: true }
    );

    return { success: true };
}


export interface MaintenanceConfig {
    isActive: boolean;
    whitelist: string;
}

export async function getMaintenanceConfig(): Promise<MaintenanceConfig> {
    await dbConnect();
    const config = await SystemConfig.findOne({ key: MAINTENANCE_MODE_CONFIG_KEY });
    
    if (!config || !config.value) {
        return { isActive: false, whitelist: '' };
    }

    if (typeof config.value === 'string') {
        return { isActive: config.value === 'true', whitelist: '' };
    }
    
    return config.value as MaintenanceConfig;
}

export async function getMaintenanceMode(): Promise<boolean> {
    await dbConnect();
    const config = await SystemConfig.findOne({ key: MAINTENANCE_MODE_CONFIG_KEY });
    
    if (!config || !config.value) {
        return false;
    }

    let isActive = false;
    let whitelist = '';

    if (typeof config.value === 'string') {
        isActive = config.value === 'true';
    } else {
        const parsed = config.value as MaintenanceConfig;
        isActive = parsed.isActive;
        whitelist = parsed.whitelist || '';
    }

    if (!isActive) return false;

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email?.toLowerCase() || '';

    const allowedEmails = whitelist
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

    if (allowedEmails.includes(userEmail)) {
        return false; // User is in whitelist, skip maintenance
    }

    return true; // Active and user not in whitelist
}

export async function updateMaintenanceConfig(isActive: boolean, whitelist: string) {
    const isAdmin = await verifyAdminServer();
    if (!isAdmin) {
        throw new Error('Unauthorized');
    }

    await dbConnect();
    await SystemConfig.findOneAndUpdate(
        { key: MAINTENANCE_MODE_CONFIG_KEY },
        { value: { isActive, whitelist } },
        { upsert: true, new: true }
    );

    return { success: true };
}


export async function getShowOfzCurve(): Promise<boolean> {
    await dbConnect();
    const config = await SystemConfig.findOne({ key: SHOW_OFZ_CURVE_CONFIG_KEY });
    return config ? config.value !== 'false' : true;
}

export async function toggleShowOfzCurve(isActive: boolean) {
    const isAdmin = await verifyAdminServer();
    if (!isAdmin) {
        throw new Error('Unauthorized');
    }

    await dbConnect();
    await SystemConfig.findOneAndUpdate(
        { key: SHOW_OFZ_CURVE_CONFIG_KEY },
        { value: isActive ? 'true' : 'false' },
        { upsert: true, new: true }
    );

    return { success: true };
}


export interface PaymentMaintenanceConfig {
    isActive: boolean;
    whitelist: string; // Запятыми разделенные email
}

export async function getPaymentMaintenanceState(): Promise<{ isMaintenance: boolean; isWhitelisted: boolean }> {
    await dbConnect();
    const config = await SystemConfig.findOne({ key: PAYMENT_MAINTENANCE_CONFIG_KEY });
    
    if (!config || !config.value) {
        return { isMaintenance: false, isWhitelisted: false };
    }
    
    const { isActive, whitelist } = config.value as PaymentMaintenanceConfig;
    
    if (!isActive) {
        return { isMaintenance: false, isWhitelisted: false };
    }

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email?.toLowerCase() || '';

    const allowedEmails = (whitelist || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

    const isWhitelisted = allowedEmails.includes(userEmail);

    return { isMaintenance: true, isWhitelisted };
}

export async function getPaymentMaintenanceConfig(): Promise<PaymentMaintenanceConfig> {
    await dbConnect();
    const config = await SystemConfig.findOne({ key: PAYMENT_MAINTENANCE_CONFIG_KEY });
    
    if (!config || !config.value) {
        return { isActive: false, whitelist: '' };
    }
    
    return config.value as PaymentMaintenanceConfig;
}

export async function updatePaymentMaintenanceConfig(isActive: boolean, whitelist: string) {
    const isAdmin = await verifyAdminServer();
    if (!isAdmin) {
        throw new Error('Unauthorized');
    }

    await dbConnect();
    await SystemConfig.findOneAndUpdate(
        { key: PAYMENT_MAINTENANCE_CONFIG_KEY },
        { value: { isActive, whitelist } },
        { upsert: true, new: true }
    );

    return { success: true };
}