import { authenticatedFetch } from '$lib/helpers/fetchHelpers';
import { AuthService } from '$lib/services/authService';
import type { ManagedUser, ManagedUserDetails, SkillStatistics } from '$lib/types/managed-user';

export class ManagerService {
	static async getManagedUsers(managerEmail: string): Promise<ManagedUser[]> {
		// Get user details from AuthService
		const managedUserDetails: ManagedUserDetails[] =
			await AuthService.getManagerUsers(managerEmail);

		// Get skill statistics from our API for each user
		const skillStatsPromises = managedUserDetails.map(async (user) => {
			const response = await authenticatedFetch(`/api/manager/managed-users/${user.accountId}`, {

				method: 'GET'
			});
			return await response.json();
		});

		const skillStats: SkillStatistics[] = await Promise.all(skillStatsPromises)

		// Merge the data
		return managedUserDetails.map((userDetail) => {
			const stats = skillStats.find((stat) => stat.accountId === userDetail.accountId) || {
				skillsCount: 0,
				skillsWithExperience: 0,
				lastChange: new Date(0),
				id: -1
			};

			return {
				...userDetail,
				id: stats.id,
				lastChange: stats.lastChange,
				skillsCount: stats.skillsCount,
				skillsWithExperience: stats.skillsWithExperience
			};
		});
	}
}
