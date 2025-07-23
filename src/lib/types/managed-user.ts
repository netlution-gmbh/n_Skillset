export interface ManagedUserDetails {
	id: number;
	accountId: string;
	email: string;
	name: string;
}

export interface SkillStatistics {
	id: number;
	accountId: string;
	skillsCount: number;
	skillsWithExperience: number;
	lastChange: Date;
}

export interface ManagedUser extends ManagedUserDetails, SkillStatistics {}
