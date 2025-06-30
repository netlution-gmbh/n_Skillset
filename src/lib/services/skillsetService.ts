import { authenticatedFetch } from '$lib/helpers/fetchHelpers';
import type { Skillset, SkillsetTemplate } from '$lib/types/skill-level';
import { skillsetTemplates } from '$lib/data/skillset-templates';

export class SkillsetService {
	/**
	 * Get a template by ID from the hardcoded templates
	 */
	static getSkillsetTemplate(templateId: string = 'default'): SkillsetTemplate {
		const template = skillsetTemplates.find((t) => t.id === templateId);
		if (!template) {
			return {
				id: 'unknown',
				name: 'Error',
				description: 'Error',
				levels: []
			};
		}
		return structuredClone(template); // Return a deep copy
	}

	/**
	 * Update user's skillset values
	 */
	static async updateSkillset(skillSet: Skillset): Promise<Skillset> {
		const response = await authenticatedFetch(`/api/skillsets/${skillSet.id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(skillSet)
		});

		if (!response.ok) {
			throw new Error(`Failed to update skillset: ${response.statusText}`);
		}

		return await response.json();
	}
}
