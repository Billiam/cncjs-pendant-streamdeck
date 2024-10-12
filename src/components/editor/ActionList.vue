<script>
import Action from './Action.vue'
</script>
<script setup>
defineProps({
  actions: {
    type: Array,
    required: true,
  },
  button: {
    type: String,
    required: true,
  },
})
</script>
<template>
  <action
    v-for="(action, index) in actions"
    :action="action"
    :index="index"
    :button="button"
  ></action>
</template>
