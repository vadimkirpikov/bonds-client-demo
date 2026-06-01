import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthApi, Configuration } from '@/lib/api';
import { cookies } from 'next/headers'; 

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const config = new Configuration({ basePath: process.env.NEXT_PUBLIC_SERVER_URL });
                    const authApi = new AuthApi(config);

                    const tokenResponse = await authApi.apiV1AuthLoginEmailPost({
                        emailLoginRequest: {
                            email: credentials.email,
                            password: credentials.password
                        }
                    });

                    if (!tokenResponse.accessToken) return null;

                    const meConfig = new Configuration({
                        basePath: process.env.NEXT_PUBLIC_SERVER_URL,
                        headers: {
                            'Authorization': `Bearer ${tokenResponse.accessToken}`
                        }
                    });
                    const meApi = new AuthApi(meConfig);
                    const me = await meApi.apiV1AuthMeGet();

                    return {
                        id: me.id || '',
                        email: me.email || '',
                        role: me.role || 'user',
                        accessToken: tokenResponse.accessToken,
                        hasActiveSubscription: me.hasActiveSubscription ?? false,
                        isTrialPeriod: me.isTrialPeriod ?? false,
                        isAutoRenewalActive: me.isAutoRenewalActive ?? false,
                        subscriptionExpiresAt: me.subscriptionExpiresAt ? new Date(me.subscriptionExpiresAt).toISOString() : null,
                    };
                } catch (e) {
                    console.error("Backend auth with credentials failed:", e);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'credentials') {
                return true;
            }

            if (account?.provider === 'google' && account.id_token) {
                try {
                    const cookieStore = await cookies();
                    const referralCode = cookieStore.get('referralCode')?.value || null;
                    console.log(process.env.NEXT_PUBLIC_SERVER_URL);

                    const config = new Configuration({ basePath: process.env.NEXT_PUBLIC_SERVER_URL });
                    const authApi = new AuthApi(config);

                    const tokenResponse = await authApi.apiV1AuthLoginPost({
                        loginProviderRequest: {
                            provider: 'google',
                            email: user.email,
                            token: account.id_token,
                            providerId: account.providerAccountId,
                            referralCode: referralCode // <-- ПЕРЕДАЕМ СЮДА
                        }
                    });

                    if (!tokenResponse.accessToken) return false;

                    const meConfig = new Configuration({
                        basePath: process.env.NEXT_PUBLIC_SERVER_URL,
                        headers: {
                            'Authorization': `Bearer ${tokenResponse.accessToken}`
                        }
                    });
                    const meApi = new AuthApi(meConfig);
                    const me = await meApi.apiV1AuthMeGet();

                    user.accessToken = tokenResponse.accessToken || '';
                    user.id = me.id || '';
                    user.role = me.role || 'user';
                    user.hasActiveSubscription = me.hasActiveSubscription ?? false;
                    user.isTrialPeriod = me.isTrialPeriod ?? false;
                    user.isAutoRenewalActive = me.isAutoRenewalActive ?? false;
                    user.subscriptionExpiresAt = me.subscriptionExpiresAt ? new Date(me.subscriptionExpiresAt).toISOString() : null;

                    return true;
                } catch (e) {
                    console.error("Backend auth failed:", e);
                    return false;
                }
            }
            return false;
        },

        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.accessToken = user.accessToken;
                token.id = user.id;
                token.role = user.role;
                token.hasActiveSubscription = user.hasActiveSubscription;
                token.isTrialPeriod = user.isTrialPeriod;
                token.isAutoRenewalActive = user.isAutoRenewalActive;
                token.subscriptionExpiresAt = user.subscriptionExpiresAt;
            }

            if (trigger === "update" && session) {
                return { ...token, ...session };
            }

            return token;
        },

        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.user.id = token.id;
            session.user.role = token.role;
            session.user.hasActiveSubscription = token.hasActiveSubscription;
            session.user.isTrialPeriod = token.isTrialPeriod;
            session.user.isAutoRenewalActive = token.isAutoRenewalActive;
            session.user.subscriptionExpiresAt = token.subscriptionExpiresAt;
            return session;
        }
    },
    pages: {
        signIn: '/auth/signin'
    }
};