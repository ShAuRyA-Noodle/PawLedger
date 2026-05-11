import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { db, schema } from "@/db";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // dev-friendly; flip on for prod
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: { type: "string", input: false, defaultValue: "donor" },
      phone: { type: "string", required: false },
      locale: { type: "string", required: false, defaultValue: "en" },
      preferredCurrency: { type: "string", required: false, defaultValue: "INR" },
      marketingOptIn: { type: "boolean", required: false, defaultValue: false },
      city: { type: "string", required: false },
      country: { type: "string", required: false, defaultValue: "IN" },
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        if (!resend) {
          console.log(`[dev] magic link for ${email}: ${url}`);
          return;
        }
        await resend.emails.send({
          from: process.env.RESEND_FROM ?? "PawLedger <hello@pawledger.org>",
          to: email,
          subject: "Sign in to PawLedger",
          text: `Sign in to PawLedger by clicking this link:\n\n${url}\n\nLink expires in 5 minutes. If you did not request this, ignore this email.`,
        });
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh once a day
  },
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") ?? ["http://localhost:3000"],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
});

export type Session = typeof auth.$Infer.Session;
