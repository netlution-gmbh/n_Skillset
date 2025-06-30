import type { UserSkill } from '$lib/types/skills';
import type { SkillScore, SkillsetTemplate } from '$lib/types/skill-level';

export function hasSkillExperience(userSkill: UserSkill): boolean {
	return userSkill.skillset?.values ? Object.values(userSkill.skillset?.values).length > 0 : false;
}

/**
 * Calculates scores for each skill level based on a template and skillset values
 * @param skillsetValues The values stored for the skillset
 * @param template The template defining parameters and possible values
 * @returns Array of scores for each level in the template
 */
export function calculateSkillsetScores(skillsetValues: Record<string, number>, template: SkillsetTemplate): Array<SkillScore> {
	if (!template || !template.levels || !skillsetValues) {
		return [];
	}

	return template.levels.map((level) => {
		let totalPoints = 0;
		let parameterCount = 0;

		// Process each parameter in the level
		level.parameters.forEach((param) => {
			const path = `levels.${level.name}.parameters.${param.name}.value`;
			let value = skillsetValues[path];

			// Skip if no value is set
			if (value === undefined || value === null) {
				value = 0;
			}

			let points = 0;

			if (param.type === 'number') {
				// For number type: value 1 = 20pts, 2 = 40pts, etc.
				points = Math.min(value * 20, 100);
			} else if (param.type === 'range') {
				// For range type: calculate percentage based on position in possible values
				const possibleValuesCount = Array.isArray(param.possibleValues) ? param.possibleValues.length : 1;
				points = (value / possibleValuesCount) * 100;
			}

			totalPoints += points;
			parameterCount++;
		});

		// Calculate the average score for this level
		const score = parameterCount > 0 ? Math.round(totalPoints / parameterCount) : 0;

		return {
			name: level.name,
			displayName: level.displayName,
			score
		};
	});
}
