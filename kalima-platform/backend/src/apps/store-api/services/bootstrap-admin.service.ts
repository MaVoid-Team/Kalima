import { prisma } from "../../../libs/db/prisma";
import {
  auth_provider_enum,
  portal_enum,
  role_enum,
} from "../generated/prisma/client";
import { userManagementService } from "./user-management.service";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function ensureInitialAdmin(): Promise<void> {
  const rawEmail = process.env.INITIAL_ADMIN_EMAIL;
  const rawPassword = process.env.INITIAL_ADMIN_PASSWORD;
  const rawName = process.env.INITIAL_ADMIN_NAME;

  if (!rawEmail || !rawPassword) {
    console.warn(
      "[BootstrapAdmin] INITIAL_ADMIN_EMAIL or INITIAL_ADMIN_PASSWORD is missing; skipping initial admin bootstrap.",
    );
    return;
  }

  const email = normalizeEmail(rawEmail);
  const password = rawPassword;
  const name = rawName?.trim() || "Super Admin";

  const existing = await prisma.users.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return;
  }

  const passwordHash = await userManagementService.hashPassword(password);

  await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: role_enum.Admin,
        is_email_verified: true,
        confirmed: true,
        auth_identities: {
          create: {
            provider: auth_provider_enum.local,
            provider_user_id: email,
            provider_email: email,
          },
        },
      },
      select: { id: true },
    });

    await tx.user_roles.createMany({
      data: [
        { user_id: user.id, portal: portal_enum.store, role: role_enum.Admin },
        {
          user_id: user.id,
          portal: portal_enum.academy,
          role: role_enum.Admin,
        },
      ],
      skipDuplicates: true,
    });
  });

  console.log(`[BootstrapAdmin] Created initial admin user: ${email}`);
}
