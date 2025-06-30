import { DataTypes, Model } from 'sequelize';
import { sequelize } from '$lib/server/db/database-connection-manager';

export class SkillModel extends Model {
	declare id: number;
	declare name: string;
	declare description: string;
	declare department: string;
	declare category: string;
	declare unit: string;
	declare templateId: string;
	declare createdAt: Date;
	declare updatedAt: Date;
}

SkillModel.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		department: {
			type: DataTypes.STRING,
			allowNull: false
		},
		category: {
			type: DataTypes.STRING,
			allowNull: false
		},
		unit: {
			type: DataTypes.STRING,
			allowNull: false
		},
		templateId: {
			type: DataTypes.STRING,
			allowNull: false
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
		modelName: 'Skill',
		tableName: 'skills',
		timestamps: true
	}
);
