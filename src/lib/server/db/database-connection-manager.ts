import { Sequelize } from 'sequelize';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

// Define the interface for ConnectionStatus
export interface ConnectionStatus {
	canConnect: boolean;
	isInitialized: boolean;
	errorMessage: null | string;
}
export const sequelize = new Sequelize({
	dialect: 'postgres',
	host: env.POSTGRES_HOST || 'localhost',
	port: parseInt(env.POSTGRES_PORT),
	username: env.POSTGRES_USER,
	password: env.POSTGRES_PASSWORD,
	database: env.POSTGRES_DB,
	logging: publicEnv.PUBLIC_DEV_MODE === 'true' ? console.log : false,
	dialectOptions:
		publicEnv.PUBLIC_DEV_MODE === 'true'
			? {}
			: {
					ssl: {
						require: true
					}
				},
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	},
	retry: {
		max: 3
	}
});

export class Database {
	// Static method to test the database connection
	static async testConnection(): Promise<ConnectionStatus> {
		const result: ConnectionStatus = {
			canConnect: false,
			isInitialized: false,
			errorMessage: null
		};

		try {
			// First, try to connect to the database
			await sequelize.authenticate({
				retry: {
					max: 3,
					timeout: 5000
				}
			});

			// If we get here, we can connect to the database
			result.canConnect = true;

			try {
				// Check if tables exist
				const tables = await sequelize.getQueryInterface().showAllTables();

				// Check specifically for Config table
				if (tables.includes('configs')) {
					// Use direct SQL to check for isInitialized flag to avoid circular imports
					const [results] = await sequelize.query('SELECT value FROM "configs" WHERE key = \'initialized\'');

					// Check if isInitialized is set to true
					if (results && results.length > 0) {
						result.isInitialized = (results[0] as { value: string }).value === 'true';
					} else {
						result.isInitialized = false;
					}
				} else {
					// Config table doesn't exist
					result.isInitialized = false;
					result.errorMessage = 'Config table does not exist';
				}
			} catch (tableError) {
				// Error checking tables
				result.isInitialized = false;
				result.errorMessage = `Error checking tables: ${(tableError as Error).message}`;
			}
		} catch (connectionError) {
			// Failed to connect to the database
			result.canConnect = false;
			result.isInitialized = false;
			result.errorMessage = `Unable to connect to database: ${(connectionError as Error).message}`;
		}

		return result;
	}

	// Static method to initialize the database
	static async initializeDatabase(): Promise<ConnectionStatus> {
		const status = await this.testConnection();

		// If we can't connect, we can't initialize
		if (!status.canConnect) {
			console.error('Cannot initialize database: Connection failed');
			return status;
		}

		try {
			// Sync all models - create tables if they don't exist
			await import('./models/index');
			const { UserModel } = await import('./models');

			await sequelize.sync({ force: false });

			// Check if system user exists
			const systemUser = await UserModel.findOne({
				where: { accountId: 'system' }
			});

			// Create system user if it doesn't exist
			if (!systemUser) {
				await UserModel.create({
					id: -1,
					accountId: 'system',
					name: 'System User',
					email: 'system@example.com'
				});
			}

			// Update status to indicate successful initialization
			status.isInitialized = true;
			return status;
		} catch (error) {
			console.error('Error initializing database:', error);
			status.errorMessage = `Database initialization failed: ${(error as Error).message}`;
			status.isInitialized = false;
			return status;
		}
	}
}

// Export the Sequelize instance for backward compatibility
export default Database;
