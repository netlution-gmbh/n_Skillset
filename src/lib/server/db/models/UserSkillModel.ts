import { DataTypes, Model } from 'sequelize';
import { sequelize } from '$lib/server/db/database-connection-manager';

interface SkillTag {
	name: string;
	level: number;
}

export class UserSkillModel extends Model {
	declare id: number;
	declare userId: number;
	declare skillId: number;
	declare skillsetId: number;
	declare tags: SkillTag[];
	declare createdAt: Date;
	declare updatedAt: Date;
}

UserSkillModel.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'users',
				key: 'id'
			}
		},
		skillId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'skills',
				key: 'id'
			}
		},
		skillsetId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'skillsets',
				key: 'id'
			}
		},
		tags: {
			type: DataTypes.JSONB,
			defaultValue: [],
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
		modelName: 'UserSkill',
		tableName: 'user_skills',
		timestamps: true,
		indexes: [
			{
				fields: ['userId', 'skillId'],
				unique: true
			}
		]
	}
);
