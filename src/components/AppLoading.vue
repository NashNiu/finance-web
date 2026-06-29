<template>
  <div class="app-loading">
    <div class="app-loading__stage" :style="{ '--ld-size': size + 'px' }">
      <svg class="app-loading__mascot" viewBox="0 0 96 96" aria-hidden="true">
        <g transform="translate(48 47) scale(0.82) translate(-48 -47)">
          <!-- ears -->
          <ellipse cx="19" cy="40" rx="9" ry="13" fill="#9dbf8d" transform="rotate(-28 19 40)" />
          <ellipse cx="77" cy="40" rx="9" ry="13" fill="#9dbf8d" transform="rotate(28 77 40)" />
          <!-- horns -->
          <path d="M37 26 C30 20 28 12 33 10 C35 16 40 22 42 26 Z" fill="#ecc35a" />
          <path d="M59 26 C66 20 68 12 63 10 C61 16 56 22 54 26 Z" fill="#ecc35a" />
          <!-- head -->
          <circle cx="48" cy="50" r="32" fill="#9dbf8d" />
          <!-- eyes -->
          <circle cx="38" cy="44" r="8" fill="#ffffff" />
          <circle cx="58" cy="44" r="8" fill="#ffffff" />
          <circle cx="39" cy="45" r="3.6" fill="#33402f" />
          <circle cx="57" cy="45" r="3.6" fill="#33402f" />
          <!-- muzzle + smile -->
          <ellipse cx="48" cy="62" rx="17" ry="12" fill="#eef5ea" />
          <circle cx="42" cy="60" r="2" fill="#9dbf8d" />
          <circle cx="54" cy="60" r="2" fill="#9dbf8d" />
          <path d="M42 66 Q48 70 54 66" fill="none" stroke="#7aa86a" stroke-width="2.2" stroke-linecap="round" />
        </g>
      </svg>
      <span class="app-loading__shadow"></span>
    </div>
    <span v-if="text !== ''" class="app-loading__text">{{ text ?? t('components.loading') }}</span>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

withDefaults(defineProps<{ size?: number; text?: string }>(), {
  size: 56,
});
</script>

<style scoped>
.app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 40px 0;
}
.app-loading__stage {
  position: relative;
  width: var(--ld-size);
  height: calc(var(--ld-size) + 14px);
}
.app-loading__mascot {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--ld-size);
  height: var(--ld-size);
  transform-origin: 50% 100%;
  animation: ld-hop 0.85s ease-in-out infinite;
}
.app-loading__shadow {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: calc(var(--ld-size) * 0.62);
  height: 7px;
  border-radius: 50%;
  background: rgba(60, 74, 56, 0.22);
  transform: translateX(-50%);
  animation: ld-shadow 0.85s ease-in-out infinite;
}
.app-loading__text {
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--qz-text-sub);
}

/* mascot hops up with a little squash-and-stretch */
@keyframes ld-hop {
  0% {
    transform: translateY(0) scale(1.06, 0.94);
  }
  25% {
    transform: translateY(-30%) scale(0.98, 1.04);
  }
  50% {
    transform: translateY(-40%) scale(1, 1);
  }
  75% {
    transform: translateY(-30%) scale(0.98, 1.04);
  }
  100% {
    transform: translateY(0) scale(1.06, 0.94);
  }
}

/* shadow shrinks and fades as the mascot rises */
@keyframes ld-shadow {
  0%,
  100% {
    transform: translateX(-50%) scaleX(1);
    opacity: 0.26;
  }
  50% {
    transform: translateX(-50%) scaleX(0.55);
    opacity: 0.1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-loading__mascot {
    animation: ld-breathe 1.6s ease-in-out infinite;
  }
  .app-loading__shadow {
    animation: none;
    opacity: 0.18;
  }
  @keyframes ld-breathe {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.06);
    }
  }
}
</style>
