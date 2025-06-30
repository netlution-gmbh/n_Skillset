import { get, writable } from 'svelte/store';
import type { UserSkill } from '$lib/types/skills';
import type { Skillset } from '$lib/types/skill-level';

// Define the complete editor state
interface EditorState {
	// Collection and navigation
	userSkills: UserSkill[];
	currentIndex: number;

	// Current skill data
	currentSkill: UserSkill | null;
	currentSkillset: Skillset | null;
	template: any | null;

	// UI state
	loading: boolean;
	error: string | null;

	// Navigation state (added directly to the main state)
	navigation: {
		isFirst: boolean;
		isLast: boolean;
		totalSkills: number;
		currentIndex: number;
	};
}

// Create the initial state
const initialState: EditorState = {
	userSkills: [],
	currentIndex: 0,
	currentSkill: null,
	currentSkillset: null,
	template: null,
	loading: false,
	error: null,
	navigation: {
		isFirst: true,
		isLast: true,
		totalSkills: 0,
		currentIndex: 0
	}
};

// Create the store
function createEditorStore() {
	const { subscribe, set, update } = writable<EditorState>(initialState);

	// Wrap the update function to always update navigation state
	const wrappedUpdate = (updater: (state: EditorState) => EditorState) => {
		update((state) => {
			const updatedState = updater(state);

			// Always update navigation state
			return {
				...updatedState,
				navigation: {
					isFirst: updatedState.currentIndex === 0,
					isLast: updatedState.currentIndex === updatedState.userSkills.length - 1,
					totalSkills: updatedState.userSkills.length,
					currentIndex: updatedState.currentIndex
				}
			};
		});
	};

	return {
		subscribe,
		set: (newState: EditorState) => {
			// Update navigation state before setting
			const updatedState = {
				...newState,
				navigation: {
					isFirst: newState.currentIndex === 0,
					isLast: newState.currentIndex === newState.userSkills.length - 1,
					totalSkills: newState.userSkills.length,
					currentIndex: newState.currentIndex
				}
			};
			set(updatedState);
		},
		update: wrappedUpdate,

		// Reset the store to initial state
		reset: () => set(initialState),

		// Get the current state (for use in services)
		getState: () => get({ subscribe })
	};
}

// Export the singleton store
export const editorStore = createEditorStore();
