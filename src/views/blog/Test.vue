<template>
    <EditorHtml v-model="markdownContent"></EditorHtml>
    {{markdownContent}}
</template>
<script setup>
import { ref } from "vue";

const markdownContent =ref("teet")
</script>
<style lang="scss">

</style>