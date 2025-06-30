export interface ManagedUserDetails {
	id: string;
	email: string;
	name: string;
}

export interface SkillStatistics {
	id: string;
	skillsCount: number;
	skillsWithExperience: number;
	lastChange: Date;
}

export interface ManagedUser extends ManagedUserDetails, SkillStatistics {}
