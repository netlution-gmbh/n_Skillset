export interface Skillset {
	id?: string;
	templateId: string;
	values: {
		[path: string]: number;
	};
	createdAt?: Date;
	updatedAt?: Date;
}

export interface SkillsetTemplate {
	name: string;
	id: string;
	description: string;
	levels: SkillLevel[];
}

export interface SkillLevel {
	name: string;
	displayName: string;
	description: string;
	parameters: SkillParameters[];
}

export interface SkillParameters {
	name: string;
	type: 'number' | 'range';
	displayName: string;
	possibleValues: RegExp | string[] | number[];
}

export interface SkillScore {
	name: string;
	displayName: string;
	score: number;
}
