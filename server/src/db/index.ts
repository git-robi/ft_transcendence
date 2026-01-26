import {Pool, PoolConfig, QueryResult} from "pg";
import vaultClient from "../config/vault";

// Crear pool de forma lazy para que Vault pueda inicializarse primero
let pool: Pool | null = null;

function getPool(): Pool {
    if (!pool) {
        // Obtener configuración de base de datos desde Vault
        const dbConfig = vaultClient.getDatabaseConfig();
        
        const poolConfig: PoolConfig = {
            user: dbConfig.user,
            host: dbConfig.host,
            database: dbConfig.database,
            port: parseInt(dbConfig.port),
            password: dbConfig.password,
            // Configuración de seguridad para conexiones
            ssl: process.env.NODE_ENV === 'production' ? {
                rejectUnauthorized: true,
            } : false,
        };

        pool = new Pool(poolConfig);

        pool.on("connect", () => {
            console.log("Connected to the database");
        });

        pool.on("error", (err: Error) => {
            // No exponer detalles del error en producción
            console.error("Database error:", process.env.NODE_ENV === 'development' ? err : 'Database connection error');
        });
    }
    return pool;
}

// Crear un objeto proxy que delegue al pool real
// Esto permite que el pool se cree de forma lazy cuando se use por primera vez
const db = {
    query: (text: string, params?: any[]): Promise<QueryResult> => {
        return getPool().query(text, params);
    },
    // Delegar otros métodos del Pool si se necesitan
    connect: () => getPool().connect(),
    end: () => getPool().end(),
};

export default db;
