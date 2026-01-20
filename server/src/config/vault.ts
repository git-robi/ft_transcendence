import vault from 'node-vault';

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
        '42'?: {
            client_id: string;
            client_secret: string;
            redirect_uri: string;
        };
    };
}

class VaultClient {
    private client: vault.client;
    private secrets: VaultSecrets | null = null;
    private initialized: boolean = false;

    constructor() {
        const vaultAddr = process.env.VAULT_ADDR || 'http://localhost:8200';
        const vaultToken = process.env.VAULT_TOKEN || 'dev-root-token-change-in-production';

        this.client = vault({
            endpoint: vaultAddr,
            token: vaultToken,
        });
    }

    /**
     * Inicializa el cliente de Vault y carga todos los secretos
     * Debe llamarse antes de usar cualquier secreto
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        try {
            // Verificar que Vault esté disponible
            await this.client.health();

            // Cargar secretos desde Vault
            const [jwtSecret, dbSecret, oauthSecret] = await Promise.all([
                this.client.read('transcendence/data/jwt').catch(() => null),
                this.client.read('transcendence/data/database').catch(() => null),
                this.client.read('transcendence/data/oauth/42').catch(() => null),
            ]);

            this.secrets = {
                jwt: {
                    secret: jwtSecret?.data?.data?.secret || process.env.JWT_SECRET || '',
                },
                database: {
                    user: dbSecret?.data?.data?.user || process.env.PGUSER || 'postgres',
                    password: dbSecret?.data?.data?.password || process.env.PGPASSWORD || '',
                    host: dbSecret?.data?.data?.host || process.env.PGHOST || 'localhost',
                    port: dbSecret?.data?.data?.port || process.env.PGPORT || '5432',
                    database: dbSecret?.data?.data?.database || process.env.PGDATABASE || 'transcendence',
                },
            };

            if (oauthSecret?.data?.data) {
                this.secrets.oauth = {
                    '42': {
                        client_id: oauthSecret.data.data.client_id || '',
                        client_secret: oauthSecret.data.data.client_secret || '',
                        redirect_uri: oauthSecret.data.data.redirect_uri || '',
                    },
                };
            }

            // Validar que los secretos críticos estén presentes
            if (!this.secrets.jwt.secret) {
                throw new Error('JWT_SECRET no encontrado en Vault ni en variables de entorno');
            }

            if (!this.secrets.database.password) {
                throw new Error('Database password no encontrado en Vault ni en variables de entorno');
            }

            this.initialized = true;
            console.log('Vault inicializado correctamente. Secretos cargados.');
        } catch (error) {
            console.error('Error al inicializar Vault:', error);
            // En desarrollo, permitir fallback a variables de entorno
            if (process.env.NODE_ENV === 'production') {
                throw error;
            }
            console.warn('Usando variables de entorno como fallback');
            this.initialized = true;
        }
    }

    /**
     * Obtiene el secreto JWT
     */
    getJwtSecret(): string {
        if (!this.initialized) {
            throw new Error('Vault no ha sido inicializado. Llama a initialize() primero.');
        }
        return this.secrets!.jwt.secret;
    }

    /**
     * Obtiene las credenciales de la base de datos
     */
    getDatabaseConfig() {
        if (!this.initialized) {
            throw new Error('Vault no ha sido inicializado. Llama a initialize() primero.');
        }
        return this.secrets!.database;
    }

    /**
     * Obtiene la URL completa de conexión a la base de datos (para Prisma)
     */
    getDatabaseUrl(): string {
        if (!this.initialized) {
            throw new Error('Vault no ha sido inicializado. Llama a initialize() primero.');
        }
        const db = this.secrets!.database;
        return `postgresql://${db.user}:${db.password}@${db.host}:${db.port}/${db.database}`;
    }

    /**
     * Obtiene la configuración de OAuth para el proveedor especificado
     */
    getOAuthConfig(provider: '42') {
        if (!this.initialized) {
            throw new Error('Vault no ha sido inicializado. Llama a initialize() primero.');
        }
        return this.secrets!.oauth?.[provider];
    }

    /**
     * Recarga los secretos desde Vault (útil para rotación de secretos)
     */
    async refresh(): Promise<void> {
        this.initialized = false;
        await this.initialize();
    }
}

// Singleton instance
const vaultClient = new VaultClient();

export default vaultClient;

