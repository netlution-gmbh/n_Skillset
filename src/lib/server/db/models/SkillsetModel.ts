import { DataTypes, Model } from 'sequelize';
import { sequelize } from '$lib/server/db/database-connection-manager';

export class SkillsetModel extends Model {
	declare id: number;
	declare templateId: string;
	declare values: { [path: string]: number };
	declare createdAt: Date;
	declare updatedAt: Date;
}

SkillsetModel.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		templateId: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'default'
		},
		values: {
			type: DataTypes.JSONB,
			allowNull: false,
			defaultValue: {},
			validate: {
				isObject(value: unknown) {
					if (typeof value !== 'object' || Array.isArray(value)) {
						throw new Error('Values must be an object');
					}
				}
			}
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		}
	},
	{
		sequelize,
		modelName: 'Skillset',
		tableName: 'skillsets',
		timestamps: true
	}
);
