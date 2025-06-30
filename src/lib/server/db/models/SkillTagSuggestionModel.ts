import { DataTypes, Model } from 'sequelize';
import { sequelize } from '$lib/server/db/database-connection-manager';

export class SkillTagSuggestionModel extends Model {
	declare id: number;
	declare name: string;
	declare parentSkill: number;
	declare usageCount: number;
}

SkillTagSuggestionModel.init(
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
		parentSkill: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'skills',
				key: 'id'
			}
		},
		usageCount: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		}
	},
	{
		sequelize,
		modelName: 'SkillTagSuggestion',
		tableName: 'skill_tag_suggestions',
		timestamps: false,
		indexes: [
			{
				fields: ['name', 'parentSkill'],
				unique: true
			}
		]
	}
);
