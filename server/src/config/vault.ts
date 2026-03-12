import vault from 'node-vault';
import fs from 'node:fs';

interface VaultSecrets {
    jwt: {
        secret: string;
    };
    database: {
        user: string;
        password: string;
        host: string;
        port: string;
        database: string;
    };
    oauth?: {
        github?: {
            client_id: string;
            client_secret: string;
            redirect_uri: string;
        };
        '42'?: {
            client_id: string;
            client_secret: string;
            redirect_uri: string;
        };
    };
}

class VaultClient {
    private client: any;
    private secrets: VaultSecrets | null = null;
    private initialized: boolean = false;

    constructor() {
        const vaultAddr = process.env.VAULT_ADDR || 'http://localhost:8200';
        let vaultToken = process.env.VAULT_TOKEN || '';
        if (!vaultToken && process.env.VAULT_TOKEN_FILE) {
            try {
                vaultToken = fs.readFileSync(process.env.VAULT_TOKEN_FILE, 'utf8').trim();
            } catch {
                vaultToken = '';
            }
        }
        if (!vaultToken) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('VAULT_TOKEN or VAULT_TOKEN_FILE must be configured in production');
            }
            console.warn('Vault token is not configured; falling back to environment-based secrets when Vault is unavailable');
        }

        this.client = vault({
            endpoint: vaultAddr,
            token: vaultToken,
        });
    }

    /**
     * Initializes the Vault client and loads all secrets.
     * Must be called before accessing any secret.
     */
    async initialize(retries = 5, delayMs = 3000): Promise<void> {
        if (this.initialized) {
            return;
        }

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await this._tryInitialize();
            } catch (error) {
                if (attempt < retries) {
                    console.warn(`Vault init attempt ${attempt}/${retries} failed, retrying in ${delayMs / 1000}s...`);
                    await new Promise(r => setTimeout(r, delayMs));
                } else {
                    throw error;
                }
            }
        }
    }

    private async _tryInitialize(): Promise<void> {
        try {
            // Check Vault health
            await this.client.health();

            // Load secrets from Vault
            const [jwtSecret, dbSecret, oauthGithubSecret, oauthLegacy42Secret] = await Promise.all([
                this.client.read('transcendence/data/jwt').catch(() => null),
                this.client.read('transcendence/data/database').catch(() => null),
                this.client.read('transcendence/data/oauth/github').catch(() => null),
                this.client.read('transcendence/data/oauth/42').catch(() => null),
            ]);

            this.secrets = {
                jwt: {
                    secret: jwtSecret?.data?.data?.secret || process.env.JWT_SECRET || '',
                },
                database: {
                    user: dbSecret?.data?.data?.user || process.env.PGUSER || 'postgres',
                    password: dbSecret?.data?.data?.password || this.resolveDatabasePassword(),
                    host: dbSecret?.data?.data?.host || process.env.PGHOST || 'localhost',
                    port: dbSecret?.data?.data?.port || process.env.PGPORT || '5432',
                    database: dbSecret?.data?.data?.database || process.env.PGDATABASE || 'transcendence',
                },
            };

            this.secrets.oauth = {};
            if (oauthGithubSecret?.data?.data) {
                this.secrets.oauth.github = {
                    client_id: oauthGithubSecret.data.data.client_id || '',
                    client_secret: oauthGithubSecret.data.data.client_secret || '',
                    redirect_uri: oauthGithubSecret.data.data.redirect_uri || '',
                };
            }
            if (oauthLegacy42Secret?.data?.data) {
                this.secrets.oauth['42'] = {
                    client_id: oauthLegacy42Secret.data.data.client_id || '',
                    client_secret: oauthLegacy42Secret.data.data.client_secret || '',
                    redirect_uri: oauthLegacy42Secret.data.data.redirect_uri || '',
                };
            }

            // Validate that critical secrets are present
            if (!this.secrets.jwt.secret) {
                throw new Error('JWT_SECRET not found in Vault nor in environment variables');
            }

            if (!this.secrets.database.password) {
                throw new Error('Database password not found in Vault nor in environment variables');
            }

            this.initialized = true;
            console.log('Vault initialized successfully. Secrets loaded.');
        } catch (error) {
            console.error('Error initializing Vault:', error);
            // In development, allow fallback to environment variables
            if (process.env.NODE_ENV === 'production') {
                throw error;
            }
            console.warn('Falling back to environment variables');
            const fallbackDb = {
                user: process.env.PGUSER || 'postgres',
                password: process.env.PGPASSWORD || '',
                host: process.env.PGHOST || 'localhost',
                port: process.env.PGPORT || '5432',
                database: process.env.PGDATABASE || 'transcendence',
            };

            if (process.env.DATABASE_URL) {
                try {
                    const parsed = new URL(process.env.DATABASE_URL);
                    fallbackDb.user = decodeURIComponent(parsed.username || fallbackDb.user);
                    fallbackDb.password = decodeURIComponent(parsed.password || fallbackDb.password);
                    fallbackDb.host = parsed.hostname || fallbackDb.host;
                    fallbackDb.port = parsed.port || fallbackDb.port;
                    fallbackDb.database = parsed.pathname.replace(/^\//, '') || fallbackDb.database;
                } catch {
                    // Keep default fallback values when DATABASE_URL parsing fails.
                }
            }

            this.secrets = {
                jwt: {
                    secret: process.env.JWT_SECRET || '',
                },
                database: fallbackDb,
            };
            this.initialized = true;
        }
    }

    /**
     * Returns the JWT secret.
     */
    getJwtSecret(): string {
        if (!this.initialized) {
            throw new Error('Vault is not initialized. Call initialize() first.');
        }
        return this.secrets!.jwt.secret;
    }

    /**
     * Returns the database credentials.
     */
    getDatabaseConfig() {
        if (!this.initialized) {
            throw new Error('Vault is not initialized. Call initialize() first.');
        }
        return this.secrets!.database;
    }

    /**
     * Returns the full database connection URL (for Prisma).
     */
    getDatabaseUrl(): string {
        if (!this.initialized) {
            throw new Error('Vault is not initialized. Call initialize() first.');
        }
        const db = this.secrets!.database;
        return `postgresql://${db.user}:${db.password}@${db.host}:${db.port}/${db.database}`;
    }

    /**
     * Returns OAuth config for the specified provider.
     */
    getOAuthConfig(provider: 'github' | '42') {
        if (!this.initialized) {
            throw new Error('Vault is not initialized. Call initialize() first.');
        }
        return this.secrets!.oauth?.[provider];
    }

    /**
     * Reloads secrets from Vault (useful for secret rotation).
     */
    async refresh(): Promise<void> {
        this.initialized = false;
        await this.initialize();
    }

    private resolveDatabasePassword(): string {
        const fromFile = process.env.PGPASSWORD_FILE;
        if (fromFile) {
            try {
                return fs.readFileSync(fromFile, 'utf8').trim();
            } catch {
                // Fall back below.
            }
        }

        const raw = process.env.PGPASSWORD || '';
        if (!raw) return '';

        // Support legacy config where PGPASSWORD contains a secret file path.
        if (raw.startsWith('/') && fs.existsSync(raw)) {
            try {
                return fs.readFileSync(raw, 'utf8').trim();
            } catch {
                return '';
            }
        }

        return raw;
    }
}

// Singleton instance
const vaultClient = new VaultClient();

export default vaultClient;
