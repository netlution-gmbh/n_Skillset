import { DataTypes, Model } from 'sequelize';
import { sequelize } from '$lib/server/db/database-connection-manager';

export class CertificateModel extends Model {
	declare id: number;
	declare name: string;
	declare userSkillId: number;
	declare userId: number;
	declare date: Date;
	declare renewal_date: Date;
	declare createdAt: Date;
	declare updatedAt: Date;
}

CertificateModel.init(
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
		userSkillId: {
			type: DataTypes.INTEGER, // Foreign key to UserSkill table
			allowNull: true,
			references: {
				model: 'user_skills', // References the UserSkill table
				key: 'id'
			}
		},
		userId: {
			type: DataTypes.INTEGER, // Foreign key to User table
			allowNull: false,
			references: {
				model: 'users', // References the User table
				key: 'id'
			}
		},
		date: {
			type: DataTypes.DATE,
			allowNull: false
		},
		renewal_date: {
			type: DataTypes.DATE,
			allowNull: true
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
		modelName: 'Certificate',
		tableName: 'certificates',
		timestamps: true
	}
);
