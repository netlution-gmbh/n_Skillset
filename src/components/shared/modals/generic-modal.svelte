<script lang="ts">
    import { Button, Modal } from 'flowbite-svelte';

    // Props
    export let title: string;
    export let message: string;
    export let confirmText: string = 'Bestätigen';
    export let cancelText: string = 'Abbrechen';
    export let confirmButtonColor: 'primary' | 'red' | 'green' | 'yellow' | 'blue' = 'primary';
    export let onConfirm: () => Promise<void>;
    export let onCancel: () => void;
    export let isProcessing: boolean = false;
    export let open: boolean = true;

    function handleCancel() {
        open = false;
        onCancel();
    }
</script>

<Modal
        bind:open
        size="md"
        {title}
        autoclose={false}
>
    <div class="p-4 border border-gray-200 rounded-lg bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
        <p class="text-gray-700 dark:text-gray-300 mb-4">
            <!-- eslint-disable-next-line svelte/no-at-html-tags  -->
            {@html message}
        </p>
    </div>

    <svelte:fragment slot="footer">
        <Button
                color={confirmButtonColor}
                disabled={isProcessing}
                on:click={onConfirm}
        >
            {#if isProcessing}
                Wird gesendet...
            {:else}
                {confirmText}
            {/if}
        </Button>
        <Button
                color="alternative"
                disabled={isProcessing}
                on:click={handleCancel}
        >
            {cancelText}
        </Button>
    </svelte:fragment>
</Modal>
