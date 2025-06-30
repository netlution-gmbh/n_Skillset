import type { Skillset } from '$lib/types/skill-level';

export const CompanySizeRange = ['Intern', 'Klein', 'Mittelstand', 'Großkunde'];
export const ContactPersonRange = ['Intern', 'Team', 'Abteilung', 'CTO', 'Vorstand'];
export const ArchitecturalLevelRange = ['Standard', 'Erfahren', 'Experte'];
export const StrategicalLevelRange = ['Oberflächlich', 'Mittel', 'Tief'];

export interface Certificate {
	id?: number;
	name: string;
	userSkillId?: number;
	userId: number;
	date: Date;
	renewal_date: Date;
}

export interface Skill {
	id: number;
	name: string;
	description: string;
	department: string;
	category: string;
	unit: string;
	templateId?: string;
}

export interface SkillTag {
	name: string;
	level: number;
}

export interface UserSkill {
	id: number;
	userId: number;
	skill: Skill;
	skillsetId: number
	skillset?: Skillset; // Optional for populated data
	createdAt?: Date;
	updatedAt?: Date;
	tags: SkillTag[];
}

export interface SkillTagSuggestion {
	name: string;
	parentSkill: string;
	usageCount: number;
}
