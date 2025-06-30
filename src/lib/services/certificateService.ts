import { authenticatedFetch } from '$lib/helpers/fetchHelpers';
import type { Certificate } from '$lib/types/skills';
import { LoadingService } from './loadingService';
import { authStore } from '$lib/stores/authStore';
import { get } from 'svelte/store';

export class CertificateService {
	/**
	 * Get all certificates for a user
	 */
	static async getAllUserCertificates(userId: number): Promise<Certificate[]> {
		const response = await authenticatedFetch(`/api/users/${userId}/certificates`);
		return response.json();
	}

	/**
	 * Delete a certificate by ID
	 */
	static async deleteCertificate(id: number): Promise<void> {
		LoadingService.showLoading();
		try {
			await authenticatedFetch(`/api/certificates/${id}`, {
				method: 'DELETE'
			});
		} finally {
			LoadingService.hideLoading();
		}
	}

	/**
	 * Add a new certificate for the current user
	 */
	static async addCertificate(certificate: Certificate): Promise<Certificate> {
		LoadingService.showLoading();
		try {
			const response = await authenticatedFetch(`/api/certificates`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(certificate)
			});

			return await response.json();
		} finally {
			LoadingService.hideLoading();
		}
	}

	/**
	 * Update an existing certificate
	 */
	static async updateCertificate(certificate: Certificate): Promise<Certificate> {
		LoadingService.showLoading();
		try {
			const response = await authenticatedFetch(`/api/certificates/${certificate.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(certificate)
			});

			return await response.json();
		} finally {
			LoadingService.hideLoading();
		}
	}

	/**
	 * Create a new certificate (without saving it)
	 */
	static createNewCertificate(): Certificate {
		return {
			name: '',
			userId: get(authStore).userId,
			date: new Date(),
			renewal_date: new Date(0)
		};
	}
}
