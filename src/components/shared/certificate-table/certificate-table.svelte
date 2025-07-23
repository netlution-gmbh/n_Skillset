<script lang="ts">
    import {
        Button,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell
    } from 'flowbite-svelte';
    import type { Certificate } from '$lib/types/skills';
    import { PenSolid, TrashBinSolid } from 'flowbite-svelte-icons';

    export let certificates: Certificate[] = [];
    export let readonly: boolean = false;
    export let onEdit: ((certificate: Certificate) => void) | undefined = undefined;
    export let onDelete: ((certificate: Certificate) => void) | undefined = undefined;

    // Helper function to format display dates
    function formatDisplayDate(date: Date | null): string {
        if (!date) return '/';
        return new Date(date).toLocaleDateString('de-DE');
    }

    // Helper function to check if renewal date is valid
    function hasValidRenewalDate(certificate: Certificate): boolean {
        return certificate.renewal_date &&
            new Date(certificate.renewal_date).getTime() > 0 &&
            new Date(certificate.renewal_date) > new Date(certificate.date);
    }
</script>

<Table striped={true}>
    <TableHead>
        <TableHeadCell>Zertifikat Name</TableHeadCell>
        <TableHeadCell>Abgeschlossen am</TableHeadCell>
        <TableHeadCell>Gültig bis</TableHeadCell>
        {#if !readonly}
            <TableHeadCell>Aktionen</TableHeadCell>
        {/if}
    </TableHead>
    <TableBody>
        {#each certificates as certificate (certificate.id)}
            <TableBodyRow>
                <TableBodyCell>{certificate.name}</TableBodyCell>
                <TableBodyCell>{formatDisplayDate(certificate.date)}</TableBodyCell>
                <TableBodyCell>
                    {hasValidRenewalDate(certificate) ? formatDisplayDate(certificate.renewal_date) : '/'}
                </TableBodyCell>
                {#if !readonly}
                    <TableBodyCell>
                        <div class="flex gap-2">
                            <Button
                                    size="xs"
                                    color="primary"
                                    on:click={() => onEdit?.(certificate)}
                                    aria-label="Zertifikat bearbeiten"
                            >
                                <PenSolid class="w-3 h-3" />
                            </Button>
                            <Button
                                    size="xs"
                                    color="red"
                                    on:click={() => onDelete?.(certificate)}
                                    aria-label="Zertifikat löschen"
                            >
                                <TrashBinSolid class="w-3 h-3" />
                            </Button>
                        </div>
                    </TableBodyCell>
                {/if}
            </TableBodyRow>
        {:else}
            <TableBodyRow>
                <TableBodyCell colspan={readonly ? 3 : 4}>
                    <div class="text-center py-4 text-gray-500">
                        Keine Zertifikate vorhanden
                    </div>
                </TableBodyCell>
            </TableBodyRow>
        {/each}
    </TableBody>
</Table>
