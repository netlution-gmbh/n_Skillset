<script lang="ts">
    import { Modal } from 'flowbite-svelte';
    import type { ManagedUser } from '$lib/types/managed-user';
    import type { Certificate } from '$lib/types/skills';
    import { CertificateService } from '$lib/services/certificateService';
    import CertificateTable from '../../../../components/shared/certificate-table/certificate-table.svelte';

    export let open: boolean = false;
    export let user: ManagedUser | null = null;

    let userCertificates: Certificate[] = [];
    let loading = false;

    // Load user certificates when modal opens and user is selected
    $: if (open && user) {
        loadUserCertificates();
    }

    async function loadUserCertificates() {
        if (!user?.id) return;

        loading = true;
        try {
            // You'll need to implement this method in CertificateService
            // or create a new service to fetch certificates for a specific user
            userCertificates = await CertificateService.getAllUserCertificates(Number(user.id));
        } catch (error) {
            console.error('Error loading user certificates:', error);
            userCertificates = [];
        } finally {
            loading = false;
        }
    }

    function closeModal() {
        open = false;
        userCertificates = [];
    }
</script>

<Modal bind:open size="xl" title="Benutzer Details" autoclose={false} on:close={closeModal}>
    {#if user}
        <div class="flex gap-6 p-4">
            <!-- Left side: User information -->
            <div class="flex-shrink-0 w-64">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {user.name}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {user.email}
                </p>

                <div class="space-y-2 text-sm">
                    <div>
                        <span class="font-medium">Skills:</span> {user.skillsCount}
                    </div>
                    <div>
                        <span class="font-medium">Erfahrungen:</span> {user.skillsWithExperience}
                    </div>
                    <div>
                        <span class="font-medium">Letzte Änderung:</span>
                        {new Date(user.lastChange).toLocaleDateString('de-DE')}
                    </div>
                </div>
            </div>

            <!-- Vertical divider -->
            <div class="w-px bg-gray-300 dark:bg-gray-600"></div>

            <!-- Right side: Certificates -->
            <div class="flex-1">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Zertifikate
                </h4>

                {#if loading}
                    <div class="text-center py-8">
                        <div class="text-gray-500">Lade Zertifikate...</div>
                    </div>
                {:else}
                    <CertificateTable
                            certificates={userCertificates}
                            readonly={true}
                    />
                {/if}
            </div>
        </div>
    {/if}

    <svelte:fragment slot="footer">
        <button
                type="button"
                class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                on:click={closeModal}
        >
            Schließen
        </button>
    </svelte:fragment>
</Modal>
