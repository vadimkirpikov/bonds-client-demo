import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        user: {
            id: string;
            email: string | null;
            role: string;
            hasActiveSubscription: boolean;
            isTrialPeriod: boolean;
            isAutoRenewalActive: boolean;
            subscriptionExpiresAt: string | null;
        } & DefaultSession["user"]
    }

    interface User {
        id: string;
        email: string | null;
        accessToken?: string;
        role: string;
        hasActiveSubscription: boolean;
        isTrialPeriod: boolean;
        isAutoRenewalActive: boolean;
        subscriptionExpiresAt: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        id: string;
        role: string;
        hasActiveSubscription: boolean;
        isTrialPeriod: boolean;
        isAutoRenewalActive: boolean;
        subscriptionExpiresAt: string | null;
    }
}