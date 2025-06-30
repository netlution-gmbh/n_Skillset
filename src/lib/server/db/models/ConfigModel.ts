import { DataTypes, Model } from 'sequelize';
import { sequelize } from '$lib/server/db/database-connection-manager';

export class ConfigModel extends Model {
	declare id: number;
	declare key: string;
	declare value: string;
	declare isPrivate: boolean;
	declare isDeprecated: boolean;
	declare lastUpdated: Date;
	declare updatedBy: string;
}

ConfigModel.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		key: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		value: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		isPrivate: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		isDeprecated: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		lastUpdated: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		updatedBy: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'users',
				key: 'id'
			}
		}
	},
	{
		sequelize,
		modelName: 'Config',
		tableName: 'configs',
		timestamps: true
	}
);
