<template>
  <div :class="['app-user-balance-profile', mode]">
    <!-- Horizontal Mode (Table/List) -->
    <template v-if="mode === 'horizontal'">
      <div class="d-flex align-center">
        <AppAvatar :img-url="user?.avatar_url" :name="user?.nickname || user?.full_name" :size="avatarSize" class="shadow-sm flex-shrink-0" />
        <div class="d-flex flex-column overflow-hidden text-right">
          <div
            class="text-body-2 font-weight-black text-slate-900 truncate line-height-1-2"
            :class="{ 'cursor-pointer hover-text-primary transition-all': clickable }"
            @click="handleClick"
          >
            {{ user?.full_name || '---' }}
            <span v-if="user?.nickname && user?.nickname !== user?.full_name" class="text-xxs text-grey ms-1 font-weight-medium opacity-70">
              ({{ user.nickname }})
            </span>
          </div>

          <div v-if="!hidePhone && user?.phone" class="">
            <AppPhone :phone="user.phone" />
          </div>

          <div v-if="!hideBalance && user?.balance != null" class="d-flex align-center mt-1">
            <AppBalanceDisplay
              :amount="user.balance"
              perspective="admin"
              show-icon
              icon-size="12"
              value-class="text-xxs font-weight-black"
              label-class="text-xxs me-1"
              custom-class="px-2 py-0-5 rounded-pill border border-opacity-25 bg-neutral-lighten-5"
              style="border-style: dashed !important"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- Vertical Mode (Hero/Details) -->
    <template v-else-if="mode === 'vertical'">
      <div class="d-flex flex-column align-center text-center">
        <div class="position-relative mb-4">
          <AppAvatar
            :img-url="user?.avatar_url"
            :name="user?.nickname || user?.full_name"
            :size="avatarSize || 130"
            rounded="circle"
            class="border-4 border-white shadow-xl position-relative"
            style="z-index: 2"
            type="user"
          />
          <div class="status-dot-large" :class="[1, '1', true, 'active'].includes(user?.status) ? 'bg-success' : 'bg-error'"></div>
        </div>

        <h2 class="text-h4 font-weight-black text-slate-900 drop-shadow-sm">
          {{ user?.full_name }}
          <div v-if="user?.nickname && user?.nickname !== user?.full_name" class="text-subtitle-1 text-grey font-weight-medium opacity-70">
            ({{ user.nickname }})
          </div>
        </h2>

        <div v-if="!hidePhone && user?.phone" class="mb-5">
          <AppPhone :phone="user.phone" class="justify-center" />
        </div>

        <v-card
          v-if="!hideBalance"
          variant="flat"
          class="rounded-xl px-8 py-4 border-dashed mx-auto shadow-sm bg-white"
          style="border: 1px dashed; max-width: 300px; border-color: rgba(var(--v-theme-primary), 0.2)"
        >
          <div class="text-xxs font-weight-bold opacity-70 text-primary mb-1">{{ balanceTitle }}</div>

          <AppBalanceDisplay
            :amount="user?.balance"
            :perspective="perspective"
            show-icon
            icon-size="24"
            value-class="text-h4 font-weight-black"
            label-class="text-subtitle-1 font-weight-bold"
            custom-class="d-flex flex-column align-center"
          />
        </v-card>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { formatCurrency } from '@/utils/formatters';
import AppAvatar from './AppAvatar.vue';
import AppPhone from './AppPhone.vue';
import AppBalanceDisplay from './AppBalanceDisplay.vue';

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  mode: {
    type: String,
    default: 'horizontal',
    validator: v => ['horizontal', 'vertical'].includes(v),
  },
  perspective: {
    type: String,
    default: 'admin',
    validator: v => ['admin', 'customer', 'formal'].includes(v),
  },
  avatarSize: {
    type: [String, Number],
    default: 45,
  },
  hidePhone: {
    type: Boolean,
    default: false,
  },
  hideBalance: {
    type: Boolean,
    default: false,
  },
  clickable: {
    type: Boolean,
    default: true,
  },
});

const router = useRouter();
const emit = defineEmits(['click']);

const balanceTitle = computed(() => {
  if (props.perspective === 'customer') return 'رصيدك الحالي';
  return 'رصيد العميل';
});

const handleClick = () => {
  if (props.clickable && props.user?.id) {
    // 1. Emit the event for custom handling if needed
    emit('click', props.user);

    // 2. Default navigation behavior
    router.push(`/app/users/${props.user.id}`);
  }
};
</script>

<style scoped>
.app-user-balance-profile {
  /* Removed width: 100% to allow proper flex behavior in navbars */
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hover-text-primary:hover {
  color: rgb(var(--v-theme-primary)) !important;
  text-decoration: underline;
}

.status-dot-large {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid white;
  z-index: 3;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.drop-shadow-sm {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.line-height-1 {
  line-height: 1 !important;
}

.text-xxs {
  font-size: 0.7rem !important;
}
</style>
