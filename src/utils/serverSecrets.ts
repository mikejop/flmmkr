import 'server-only';

import { Pool } from 'pg';

const secretNames = {
  asaasApiKey: 'asaas_api_key',
  asaasWebhookSecret: 'asaas_webhook_secret',
  resendApiKey: 'resend_api_key',
} as const;

export type ServerSecretName = keyof typeof secretNames;

const globalForSecrets = globalThis as typeof globalThis & {
  secretsPool?: Pool;
  serverSecretCache?: Map<ServerSecretName, { value: string; expiresAt: number }>;
};

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to read server secrets.');
  }

  globalForSecrets.secretsPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
  });

  return globalForSecrets.secretsPool;
}

/** Reads an allow-listed secret from Supabase Vault. Never expose this helper to client code. */
export async function getServerSecret(name: ServerSecretName): Promise<string> {
  const cache = (globalForSecrets.serverSecretCache ??= new Map());
  const cached = cache.get(name);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const vaultName = secretNames[name];
  const result = await getPool().query<{ decrypted_secret: string }>(
    'select decrypted_secret from vault.decrypted_secrets where name = $1 limit 1',
    [vaultName],
  );
  const value = result.rows[0]?.decrypted_secret?.trim();

  if (!value) {
    cache.delete(name);
    throw new Error(`Server secret "${vaultName}" is missing from Supabase Vault.`);
  }

  cache.set(name, { value, expiresAt: Date.now() + 60_000 });
  return value;
}
