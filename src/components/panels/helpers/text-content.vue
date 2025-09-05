<template>
    <render />
</template>

<script setup lang="ts">
/**
 * This component allows us to utilize custom Vue components inline with text content directly from the Storylines configuration file.
 * To add support for a new inline component, simply import it here and add it to the `components` object.
 */

import { defineAsyncComponent, h } from 'vue';

import type { PropType } from 'vue';
import type { ConfigFileStructure } from '@storylines/definitions';

const props = defineProps({
    content: {
        type: String,
        required: true
    },
    configFileStructure: {
        type: Object as PropType<ConfigFileStructure>
    }
});

const AudioPlayer = defineAsyncComponent(() => import('./audio-widget.vue'));
const Gallery = defineAsyncComponent(() => import('./gallery-widget.vue'));
const GalleryItem = defineAsyncComponent(() => import('./gallery-item.vue'));

const render = () => {
    const r = {
        components: {
            AudioPlayer,
            Gallery,
            GalleryItem
        },
        provide: {
            // Pass the configFileStructure down to the widgets. This way we don't need to include it as a prop.
            configFileStructure: props.configFileStructure
        },
        template: `<div class="px-10 md-content object-contain">${props.content || ''}</div>`
    };

    return h(r);
};
</script>
