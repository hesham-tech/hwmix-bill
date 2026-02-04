<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h5">
        <v-icon icon="ri-hourglass-line" class="me-2" color="warning" />
        {{ title }}
      </v-card-title>
      <v-card-text>
        <v-alert type="info" variant="tonal">
          <div class="d-flex align-center">
            <v-icon icon="ri-information-line" size="24" class="me-3" />
            <div>
              <div class="text-h6 mb-1">قريباً</div>
              <div>هذه الصفحة قيد التطوير وستكون متاحة قريباً</div>
            </div>
          </div>
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'الصفحة قيد التطوير',
  },
});
</script>
