import bcrypt from "bcrypt";
import { firebaseAuth } from "../../libs/auth/firebase";
import { prisma } from "../../libs/db/prisma";
import {
    generateRefreshToken,
    revokeRefreshToken,
    signAccessToken,
    verifyRefreshToken,
} from "../../libs/auth/jwt";
import type { PrismaClient } from "../../libs/db/prisma";

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
}

export interface LocalRegisterInput {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface LocalLoginInput {
    email: string;
    password: string;
}

class AuthService {
    constructor(private prismaClient: PrismaClient = prisma) {}

    async registerLocal(input: LocalRegisterInput): Promise<AuthTokens> {
        const email = input.email.trim().toLowerCase();
        const existing = await this.prismaClient.users.findFirst({
            where: { email },
            select: { id: true },
        });
        if (existing) {
            throw new Error("Email already in use");
        }

        const passwordHash = await bcrypt.hash(input.password, 12);

        const user = await this.prismaClient.users.create({
            data: {
                name: input.name,
                email,
                phone: input.phone,
                password: passwordHash,
                auth_identities: {
                    create: {
                        provider: "local",
                        provider_user_id: email,
                        provider_email: email,
                    },
                },
            },
            select: { id: true },
        });

        return this.issueTokens(user.id);
    }

    async loginLocal(input: LocalLoginInput): Promise<AuthTokens> {
        const email = input.email.trim().toLowerCase();

        const user = await this.prismaClient.users.findFirst({
            where: { email },
            select: { id: true, password: true },
        });
        if (!user || !user.password) {
            throw new Error("Invalid credentials");
        }

        const ok = await bcrypt.compare(input.password, user.password);
        if (!ok) {
            throw new Error("Invalid credentials");
        }

        return this.issueTokens(user.id);
    }

    async loginFirebase(idToken: string): Promise<AuthTokens> {
        const decoded = await firebaseAuth.verifyIdToken(idToken);
        const providerUserId = decoded.uid;
        const providerEmail = decoded.email?.toLowerCase();
        const name = decoded.name ?? providerEmail ?? "User";

        if (!providerEmail) {
            throw new Error("Firebase token does not contain an email");
        }

        const user = await this.prismaClient.users.upsert({
            where: { email: providerEmail },
            create: {
                name,
                email: providerEmail,
                is_email_verified: decoded.email_verified ?? true,
                auth_identities: {
                    create: {
                        provider: "firebase",
                        provider_user_id: providerUserId,
                        provider_email: providerEmail,
                    },
                },
            },
            update: {
                name,
                is_email_verified: decoded.email_verified ?? undefined,
                auth_identities: {
                    connectOrCreate: {
                        where: {
                            provider_provider_user_id: {
                                provider: "firebase",
                                provider_user_id: providerUserId,
                            },
                        },
                        create: {
                            provider: "firebase",
                            provider_user_id: providerUserId,
                            provider_email: providerEmail,
                        },
                    },
                },
            },
            select: { id: true },
        });

        return this.issueTokens(user.id);
    }

    async refresh(refreshToken: string): Promise<{ accessToken: string }>{
        const verified = await verifyRefreshToken(refreshToken);
        if (!verified) {
            throw new Error("Invalid refresh token");
        }

        const roleRows = await this.prismaClient.user_roles.findMany({
            where: { user_id: verified.userId },
            select: { portal: true, role: true },
        });

        const accessToken = signAccessToken({
            userId: verified.userId,
            role: roleRows.map((r) => ({ portal: String(r.portal), role: String(r.role) })),
        });

        return { accessToken };
    }

    async logout(refreshToken: string): Promise<void> {
        await revokeRefreshToken(refreshToken);
    }

    private async issueTokens(userId: number): Promise<AuthTokens> {
        const roleRows = await this.prismaClient.user_roles.findMany({
            where: { user_id: userId },
            select: { portal: true, role: true },
        });

        const accessToken = signAccessToken({
            userId,
            role: roleRows.map((r) => ({ portal: String(r.portal), role: String(r.role) })),
        });

        const refresh = await generateRefreshToken(userId);

        return {
            accessToken,
            refreshToken: refresh.token,
            refreshTokenExpiresAt: refresh.expiresAt,
        };
    }
}

export default AuthService;