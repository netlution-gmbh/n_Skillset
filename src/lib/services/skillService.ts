import { authenticatedFetch } from '../helpers/fetchHelpers';
import type { Skill } from '$lib/types/skills';

export class SkillService {
	static async getAllSkills(): Promise<Skill[]> {
		const response = await authenticatedFetch('/api/skills');
		if (!response.ok) {
			throw new Error('Failed to load skills');
		}
		return await response.json();
	}

	static async updateSkill(skill: Skill): Promise<Skill> {
		const response = await authenticatedFetch(`/api/skills/${skill.id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(skill)
		});

		if (!response.ok) {
			throw new Error('Failed to update skill');
		}

		return await response.json();
	}

	/**
	 * Creates a single skill or multiple skills in bulk
	 * @param skillData - Single skill object or array of skill objects
	 * @returns Promise resolving to created skill(s)
	 */
	static async createSkills(skillData: Skill | Skill[]): Promise<Skill | Skill[]> {
		const isArray = Array.isArray(skillData);

		try {
			const response = await authenticatedFetch('/api/skills', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(skillData)
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `Failed to create skill${isArray ? 's' : ''}: ${response.status} ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Error creating skills:', error);
			throw error;
		}
	}

	/**
	 * Deletes a single skill or multiple skills in bulk
	 * @param skillData - Single skill object or array of skill objects
	 * @returns Promise resolving to deleted skill(s)
	 */
	static async deleteSkills(skillData: Skill | Skill[]): Promise<Skill | Skill[]> {
		const isArray = Array.isArray(skillData);

		try {
			const response = await authenticatedFetch('/api/skills', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(skillData)
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `Failed to delete skill${isArray ? 's' : ''}: ${response.status} ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Error deleting skills:', error);
			throw error;
		}
	}
}
