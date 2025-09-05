<template>
    <figure class="audio-transcript flex flex-col justify-center items-center">
        <!-- audio player title, if provided. -->
        <div class="text-center font-bold">{{ props.title }}</div>

        <!-- the actual audio player -->
        <audio class="w-5/6" :src="audioSource" controls></audio>

        <!-- Transcript section. Includes show/hide button, and the transcript if provided. If no transcript is provided, "no transcript provided" will be displayed. -->
        <figcaption>
            <div
                class="cursor-pointer text-center select-none"
                :class="!transcriptOpen ? 'transcript-closed' : 'transcript-open'"
                @click="toggleTranscript"
                @keydown.enter="toggleTranscript"
                tabindex="0"
                role="button"
                :aria-expanded="transcriptOpen"
            >
                {{ !transcriptOpen ? $t('audio.transcript.show') : $t('audio.transcript.hide') }}
            </div>
            <div class="transcript" v-if="transcriptOpen" v-html="mdContent || $t('audio.transcript.none')"></div>
        </figcaption>
    </figure>
</template>

<script setup lang="ts">
import { inject, ref, onMounted, watch } from 'vue';
import MarkdownIt from 'markdown-it';
import type { ConfigFileStructure } from '@storylines/definitions';

const props = defineProps({
    src: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: false,
        default: ''
    },
    transcript: {
        type: String,
        required: false
    }
});

const transcriptOpen = ref(false);
const toggleTranscript = () => {
    transcriptOpen.value = !transcriptOpen.value;
};

const audioSource = ref(props.src);

const md = new MarkdownIt({ html: true });
const mdContent = ref('');

const configFileStructure: ConfigFileStructure | undefined = inject('configFileStructure');

onMounted((): void => {
    parseMarkdown(props.transcript || '');

    // obtain image files from ZIP folder in editor preview mode
    if (configFileStructure) {
        if (props.src.startsWith('http')) {
            // If this is a web link, no need to convert to a blob.
            audioSource.value = props.src;
        } else {
            const assetSrc = `${props.src.substring(props.src.indexOf('/') + 1)}`;
            const audioFile = configFileStructure?.zip.file(assetSrc);

            if (audioFile) {
                // Convert the image to a blob so it can be displayed locally.
                audioFile.async('blob').then((res: Blob) => {
                    audioSource.value = URL.createObjectURL(res);
                });
            }
        }
    }
});

watch(props, (newVal, oldVal) => {
    parseMarkdown(newVal.transcript || '');
});

const parseMarkdown = (text: string) => {
    mdContent.value = md
        .render(text)
        .replace(/<table/g, '<div class="table-container"><table')
        .replace(/<\/table>/g, '</table></div>');

    audioSource.value = props.src;

    document
        .querySelectorAll('.storyramp-app a:not([target])')
        .forEach((el: Element) => ((el as HTMLAnchorElement).target = '_blank'));
};
</script>

<style scoped>
.prose figcaption {
    @apply text-black mt-1 w-full;
}

.audio-transcript {
    @apply rounded-xl flex;
    background: #f1f3f4;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
}

.transcript {
    @apply rounded-b-xl p-2;
    background: #fff;
}
.transcript-closed {
    @apply rounded-b-xl;
    transition: background-color 0.3s ease;
}
.transcript-open,
.transcript-closed:hover {
    @apply bg-gray-200;
}
</style>
