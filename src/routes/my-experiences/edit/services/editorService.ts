import { UserSkillService } from '$lib/services/userSkillService';
import { SkillsetService } from '$lib/services/skillsetService';
import { LoadingService } from '$lib/services/loadingService';
import { editorStore } from '../stores/editorStore';
import type { UserSkill } from '$lib/types/skills';
import { goto } from '$app/navigation';

export class EditorService {
	/**
	 * Initialize the editor with user skills
	 */
	static initialize(skills: UserSkill[]): void {
		// Set the skills and reset the index
		editorStore.update((state) => ({
			...state,
			userSkills: skills,
			currentIndex: 0,
			currentSkill: skills.length > 0 ? skills[0] : null
		}));

		// Load data for the first skill
		if (skills.length > 0) {
			EditorService.loadCurrentSkillData();
		}
	}

	/**
	 * Navigation methods
	 */
	static async navigateNext(): Promise<void> {
		const state = editorStore.getState();
		if (state.currentIndex < state.userSkills.length - 1) {
			// First, preserve the current skillset in the current skill
			const updatedSkills = [...state.userSkills];

			// Make sure we're preserving the skillset for the current skill
			if (state.currentSkillset) {
				updatedSkills[state.currentIndex] = {
					...updatedSkills[state.currentIndex],
					skillset: { ...state.currentSkillset } // Create a deep copy
				};
			}

			const newIndex = state.currentIndex + 1;

			// Update the store with the preserved skills and new index
			editorStore.update((state) => ({
				...state,
				userSkills: updatedSkills,
				currentIndex: newIndex,
				// Make sure we're using the updated skills array
				currentSkill: updatedSkills[newIndex]
			}));

			return EditorService.loadCurrentSkillData();
		}

		editorStore.reset();
		return goto('/my-experiences');
	}

	static navigatePrevious(): Promise<void> {
		const state = editorStore.getState();
		if (state.currentIndex > 0) {
			const newIndex = state.currentIndex - 1;
			editorStore.update((state) => ({
				...state,
				currentIndex: newIndex,
				currentSkill: state.userSkills[newIndex]
			}));

			return EditorService.loadCurrentSkillData();
		}

		return Promise.resolve();
	}

	/**
	 * Load all data for the current skill
	 */
	static async loadCurrentSkillData(): Promise<void> {
		try {
			EditorService.setLoading(true);

			const state = editorStore.getState();
			const currentSkill = state.currentSkill;

			if (!currentSkill) {
				EditorService.setError('No skill available');
				return;
			}

			// Get the skillset
			const skillset = currentSkill.skillset || { templateId: 'default', values: {} };

			// Get the template
			const template = SkillsetService.getSkillsetTemplate(skillset.templateId);

			// Update all related data at once
			editorStore.update((state) => ({
				...state,
				currentSkillset: skillset,
				template,
				error: null
			}));
		} catch (err) {
			console.error('Error loading skill data:', err);
			EditorService.setError(err instanceof Error ? err.message : 'Unknown error occurred');
		} finally {
			EditorService.setLoading(false);
		}
	}

	/**
	 * Update a specific skillset value
	 */
	static updateSkillsetValue(levelName: string, paramName: string, value: any): void {
		const path = `levels.${levelName}.parameters.${paramName}.value`;

		editorStore.update((state) => {
			if (!state.currentSkillset) return state;
			const currentValues = state.currentSkillset.values || {};
			const updatedValues = {
				...currentValues,
				[path]: value
			};

			const updatedSkillset = {
				...state.currentSkillset,
				values: updatedValues
			};

			// Also update the skillset in the current skill
			if (state.currentSkill) {
				const updatedSkill = {
					...state.currentSkill,
					skillset: updatedSkillset
				};

				const newSkills = [...state.userSkills];
				newSkills[state.currentIndex] = updatedSkill;

				return {
					...state,
					currentSkill: updatedSkill,
					currentSkillset: updatedSkillset,
					userSkills: newSkills
				};
			}

			return {
				...state,
				currentSkillset: updatedSkillset
			};
		});
	}

	/**
	 * Get a specific skillset value
	 */
	static getSkillsetValue(levelName: string, paramName: string): any {
		const path = `levels.${levelName}.parameters.${paramName}.value`;
		const state = editorStore.getState();

		if (!state.currentSkillset || !state.currentSkillset.values) {
			return 0;
		}

		return state.currentSkillset.values[path] || 0;
	}

	/**
	 * Tag management
	 */
	static updateTags(tags: any[]): void {
		editorStore.update((state) => {
			if (!state.currentSkill) return state;

			const updatedSkill = { ...state.currentSkill, tags };

			const newSkills = [...state.userSkills];
			newSkills[state.currentIndex] = updatedSkill;

			return {
				...state,
				currentSkill: updatedSkill,
				userSkills: newSkills
			};
		});
	}

	/**
	 * Save all changes
	 */
	static async saveChanges(userId: number): Promise<UserSkill | undefined> {
		const state = editorStore.getState();
		const { currentSkill, currentSkillset } = state;

		if (!currentSkill) return;

		try {
			EditorService.setLoading(true);

			// Save the user skill
			const updatedSkill = await UserSkillService.updateUserSkill(userId, currentSkill);

			// Save the skillset if it exists
			if (currentSkillset && Object.values(currentSkillset.values)?.length > 0 && updatedSkill.id) {
				await SkillsetService.updateSkillset(currentSkillset);
			}

			// Create a merged skill object that preserves the original skill property
			const mergedSkill = {
				...updatedSkill,
				skill: currentSkill.skill // Explicitly preserve the skill property
			};

			// Update the store with the merged skill
			editorStore.update((state) => {
				const newSkills = [...state.userSkills];
				newSkills[state.currentIndex] = mergedSkill;

				return {
					...state,
					currentSkill: mergedSkill,
					userSkills: newSkills
				};
			});

			return mergedSkill;
		} catch (err) {
			console.error('Error saving changes:', err);
			EditorService.setError(err instanceof Error ? err.message : 'Unknown error occurred');
		} finally {
			EditorService.setLoading(false);
		}
	}

	/**
	 * Helper methods
	 */
	private static setLoading(isLoading: boolean): void {
		editorStore.update((state) => ({ ...state, loading: isLoading }));

		// Also update the global loading service
		if (isLoading) {
			LoadingService.showLoading();
		} else {
			LoadingService.hideLoading();
		}
	}

	private static setError(errorMessage: string | null): void {
		editorStore.update((state) => ({ ...state, error: errorMessage }));
	}
}
