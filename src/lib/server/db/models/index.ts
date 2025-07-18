import { UserModel } from './UserModel';
import { SkillModel } from './SkillModel';
import { SkillsetModel } from './SkillsetModel';
import { UserSkillModel } from './UserSkillModel';
import { CertificateModel } from './CertificateModel';
import { ConfigModel } from './ConfigModel';
import { SkillTagSuggestionModel } from './SkillTagSuggestionModel';

// Function to associate models after all are loaded
const associateModels = () => {
	// User associations
	UserModel.hasMany(UserSkillModel, {
		foreignKey: 'userId',
		as: 'userSkills'
	});

	// Skill associations
	SkillModel.hasMany(UserSkillModel, {
		foreignKey: 'skillId',
		as: 'skillUsers' // Changed from 'userSkills' to 'skillUsers'
	});

	// Skillset associations
	SkillsetModel.hasMany(UserSkillModel, {
		foreignKey: 'skillsetId',
		as: 'skillsetUsers' // Changed from 'userSkills' to 'skillsetUsers'
	});

	// UserSkill associations
	UserSkillModel.belongsTo(UserModel, {
		foreignKey: 'userId',
		as: 'user' // Added an alias
	});

	UserSkillModel.belongsTo(SkillModel, {
		foreignKey: 'skillId',
		as: 'skill' // Added an alias
	});

	UserSkillModel.belongsTo(SkillsetModel, {
		foreignKey: 'skillsetId',
		as: 'skillset' // Added an alias
	});

	// Config associations
	ConfigModel.belongsTo(UserModel, {
		foreignKey: 'updatedBy',
		as: 'updatedByUser'
	});
};

// Call the function to establish all associations
associateModels();

// Export models
export { UserModel, SkillModel, SkillsetModel, UserSkillModel, CertificateModel, ConfigModel, SkillTagSuggestionModel };
