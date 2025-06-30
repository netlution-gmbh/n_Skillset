<script lang="ts">
  import { onMount } from 'svelte';
  import { MessageType } from '$lib/types/message';
  import MessageBox from '../../components/layout/message-box.svelte';
  import { browser } from '$app/environment';

  // Import data from layout
  export let data;

  // Default error info
  let errorInfo = {
    title: 'Error',
    message: 'An unexpected error occurred.'
  };

  // Use error info from data if available
  if (data.errorInfo) {
    errorInfo = data.errorInfo;

    // Clean up URL if in browser context
    if (browser) {
      onMount(() => {
        // Remove error token from URL to keep it clean
        const url = new URL(window.location.href);
        url.searchParams.delete('e');
        window.history.replaceState({}, '', url.toString());
      });
    }
  }

</script>

<MessageBox
  message={{
    text: errorInfo.message,
    type: MessageType.Error,
    title: errorInfo.title
  }}
>
  <button
    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    on:click={() => window.location.href="/"}
  >
    Zur Startseite
  </button>
</MessageBox>
