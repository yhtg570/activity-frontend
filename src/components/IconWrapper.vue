<template>
  <font-awesome-icon :icon="iconName" :class="className" />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  className: {
    type: String,
    default: ''
  }
})

const iconMap = {
  'user': 'user',
  'login': 'sign-in-alt',
  'register': 'user-plus',
  'activity': 'calendar-check',
  'calendar': 'calendar',
  'location': 'map-marker-alt',
  'organization': 'building',
  'create': 'plus',
  'edit': 'edit',
  'delete': 'trash',
  'view': 'eye',
  'success': 'check-circle',
  'error': 'times-circle',
  'warning': 'exclamation-triangle',
  'info': 'info-circle',
  'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right',
  'arrow-up': 'arrow-up',
  'arrow-down': 'arrow-down',
  'time': 'clock',
  'password': 'key',
  'email': 'envelope',
  'phone': 'phone',
  'search': 'search',
  'note': 'sticky-note',
  'dashboard': 'chart-bar',
  'admin': 'user-shield'
}

const iconName = computed(() => {
  return iconMap[props.name] || 'question-circle'
})
</script>