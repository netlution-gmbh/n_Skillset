import { authenticatedFetch } from '$lib/helpers/fetchHelpers';
import type { UserSkill } from '$lib/types/skills';

export class UserSkillService {
	static async getUserSkills(skillIds: number[], userId: number): Promise<UserSkill[]> {
		const response = await authenticatedFetch(`/api/user-skills/${skillIds.join(',')}`);
		if (!response.ok) return [];

		const skills = await response.json();
		return skills.filter((skill: { userId: number }) => skill.userId === userId);
	}

	static async getAllUserSkills(userId: number): Promise<UserSkill[]> {
		const response = await authenticatedFetch(`/api/users/${userId}/userSkills`);
		if (!response.ok) return [];
		return await response.json();
	}

	static async updateUserSkill(skillId: number, userSkill: UserSkill): Promise<UserSkill> {
		// Create a copy of the userSkill object to avoid modifying the original
		const cleanedUserSkill = { ...userSkill };

		// If the userSkill has tags, filter out empty ones
		if (cleanedUserSkill.tags && Array.isArray(cleanedUserSkill.tags)) {
			cleanedUserSkill.tags = cleanedUserSkill.tags.filter((tag) => tag.name.length > 0);
		}

		const response = await authenticatedFetch(`/api/user-skills/${skillId}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(cleanedUserSkill)
		});
		return await response.json();
	}

	static async saveSelectedSkills(userId: number, skillIds: number[]): Promise<void> {
		const response = await authenticatedFetch(`/api/users/${userId}/userSkills`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ skillIds })
		});

		if (!response.ok) {
			throw new Error('Failed to save skills');
		}
	}

	static async getSelectedSkillIds(userId: number): Promise<number[]> {
		const userSkills = await this.getAllUserSkills(userId);
		return userSkills.map((skill) => (skill.skill.id || -2) as number);
	}

	static async deleteUserSkill(userId: number, skillId: number): Promise<void> {
		const response = await authenticatedFetch(`/api/users/${userId}/userSkills`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ skillId })
		});

		if (!response.ok) {
			throw new Error('Failed to delete skill');
		}
	}
}
