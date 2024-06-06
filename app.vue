<script setup lang="ts">
const state = useSharedState<{count: number}>()

// Initlize defult value if it's not exists
state.value.count ||= 0
</script>

<template>
  <div>
    {{ state }}

    <button @click="state.count++">Increament</button>
  </div>
</template>