<!-- finance-web/src/components/PeriodPicker.vue -->
<template>
  <van-popup :show="show" position="bottom" round @update:show="$emit('update:show', $event)">
    <div class="pp">
      <div class="pp__head">
        <span class="pp__summary">{{ headSummary }}</span>
        <div class="pp__tabs">
          <span
            v-for="t in TABS"
            :key="t.mode"
            class="pp__tab"
            :class="{ 'pp__tab--active': draftMode === t.mode }"
            @click="draftMode = t.mode"
          >{{ t.label }}</span>
        </div>
      </div>

      <!-- 月账单 -->
      <div v-if="draftMode === 'month'" class="pp__body">
        <div class="pp__nav">
          <span class="pp__nav-title">{{ navYear }}年</span>
          <div class="pp__nav-arrows">
            <van-icon name="arrow-up" @click="navYear--" />
            <van-icon name="arrow-down" @click="navYear++" />
          </div>
        </div>
        <div class="pp__grid">
          <span
            v-for="m in 12"
            :key="m"
            class="pp__cell"
            :class="{
              'pp__cell--sel': sel.y === navYear && sel.m === m,
              'pp__cell--future': new Date(navYear, m - 1, 1) > now,
            }"
            @click="pickMonth(navYear, m)"
          >{{ m }}月</span>
        </div>
      </div>

      <!-- 周账单 -->
      <div v-else-if="draftMode === 'week'" ref="weekBody" class="pp__body pp__body--week">
        <div
          v-for="w in weekList"
          :key="w.key"
          class="pp__week-row"
          :class="{ 'pp__week-row--sel': w.key === selWeekKey }"
          @click="pickWeek(w.key, w.start)"
        >{{ w.label }}</div>
      </div>

      <!-- 年账单 -->
      <div v-else-if="draftMode === 'year'" class="pp__body">
        <div class="pp__nav">
          <span class="pp__nav-title">{{ decadeStart }}年-{{ decadeStart + 11 }}年</span>
          <div class="pp__nav-arrows">
            <van-icon name="arrow-up" @click="decadeStart -= 12" />
            <van-icon name="arrow-down" @click="decadeStart += 12" />
          </div>
        </div>
        <div class="pp__grid">
          <span
            v-for="i in 12"
            :key="i"
            class="pp__cell"
            :class="{
              'pp__cell--sel': decadeStart + i - 1 === selYear,
              'pp__cell--future': decadeStart + i - 1 > now.getFullYear(),
            }"
            @click="pickYear(decadeStart + i - 1)"
          >{{ decadeStart + i - 1 }}年</span>
        </div>
      </div>

      <!-- 自定义 -->
      <div v-else class="pp__body">
        <div class="pp__field" @click="openDate('start')">
          <span class="pp__field-label">开始时间</span>
          <span class="pp__field-value">{{ fmtYmd(customStart) }}<van-icon name="arrow" /></span>
        </div>
        <div class="pp__field" @click="openDate('end')">
          <span class="pp__field-label">结束时间</span>
          <span class="pp__field-value">{{ fmtYmd(customEnd) }}<van-icon name="arrow" /></span>
        </div>
      </div>

      <div class="pp__footer">
        <button class="pp__btn pp__btn--cancel" @click="$emit('update:show', false)">取消</button>
        <button class="pp__btn pp__btn--ok" @click="confirm">确定</button>
      </div>
    </div>

    <van-popup v-model:show="showDate" position="bottom" round teleport="body">
      <van-date-picker
        v-model="dateValue"
        :title="dateTarget === 'start' ? '开始时间' : '结束时间'"
        @confirm="onDateConfirm"
        @cancel="showDate = false"
      />
    </van-popup>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { showToast } from 'vant';
import {
  makePeriod, makeCustomPeriod, weeksOfYear, type Period, type PeriodMode,
} from '@/utils/period';

const props = defineProps<{ show: boolean; period: Period }>();
const emit = defineEmits<{ 'update:show': [boolean]; confirm: [Period] }>();

const TABS: { mode: PeriodMode; label: string }[] = [
  { mode: 'week', label: '周账单' },
  { mode: 'month', label: '月账单' },
  { mode: 'year', label: '年账单' },
  { mode: 'custom', label: '自定义' },
];

const now = ref(new Date());
const pad = (n: number) => String(n).padStart(2, '0');
const fmtYmd = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

const draftMode = ref<PeriodMode>(props.period.mode);
const navYear = ref(props.period.start.getFullYear());
const decadeStart = ref(props.period.start.getFullYear() - 2);
const sel = reactive({ y: props.period.start.getFullYear(), m: props.period.start.getMonth() + 1 });
const selYear = ref(props.period.start.getFullYear());
const selWeekStart = ref<Date>(props.period.start);
const selWeekKey = ref('');
const customStart = ref<Date>(props.period.start);
const customEnd = ref<Date>(new Date(props.period.end.getFullYear(), props.period.end.getMonth(), props.period.end.getDate() - 1));

const weekBody = ref<HTMLElement>();
const weekList = computed(() => weeksOfYear(selWeekStart.value.getFullYear(), now.value));

const headSummary = computed(() => {
  if (draftMode.value === 'month') return `${sel.y}年${sel.m}月`;
  if (draftMode.value === 'year') return `${selYear.value}年`;
  if (draftMode.value === 'week') return makePeriod('week', selWeekStart.value, now.value).label;
  return makeCustomPeriod(customStart.value, customEnd.value).label;
});

function init() {
  now.value = new Date();
  const s = props.period.start;
  draftMode.value = props.period.mode;
  navYear.value = s.getFullYear();
  decadeStart.value = s.getFullYear() - 2;
  sel.y = s.getFullYear();
  sel.m = s.getMonth() + 1;
  selYear.value = s.getFullYear();
  selWeekStart.value = s;
  selWeekKey.value = `${s.getFullYear()}-${pad(s.getMonth() + 1)}-${pad(s.getDate())}`;
  customStart.value = s;
  customEnd.value = new Date(props.period.end.getFullYear(), props.period.end.getMonth(), props.period.end.getDate() - 1);
}

watch(() => props.show, (v) => { if (v) { init(); if (draftMode.value === 'week') scrollToSelWeek(); } }, { immediate: true });
watch(draftMode, (m) => { if (m === 'week') scrollToSelWeek(); });

async function scrollToSelWeek() {
  await nextTick();
  weekBody.value?.querySelector('.pp__week-row--sel')?.scrollIntoView({ block: 'center' });
}

function pickMonth(y: number, m: number) {
  if (new Date(y, m - 1, 1) > now.value) return;
  sel.y = y;
  sel.m = m;
}
function pickYear(y: number) {
  if (y > now.value.getFullYear()) return;
  selYear.value = y;
}
function pickWeek(key: string, start: Date) {
  selWeekKey.value = key;
  selWeekStart.value = start;
}

const showDate = ref(false);
const dateTarget = ref<'start' | 'end'>('start');
const dateValue = ref<string[]>([]);
function openDate(t: 'start' | 'end') {
  dateTarget.value = t;
  const d = t === 'start' ? customStart.value : customEnd.value;
  dateValue.value = [String(d.getFullYear()), pad(d.getMonth() + 1), pad(d.getDate())];
  showDate.value = true;
}
function onDateConfirm() {
  const [y, m, d] = dateValue.value.map(Number);
  const picked = new Date(y, m - 1, d);
  if (dateTarget.value === 'start') customStart.value = picked;
  else customEnd.value = picked;
  showDate.value = false;
}

function confirm() {
  let period: Period;
  if (draftMode.value === 'week') period = makePeriod('week', selWeekStart.value, now.value);
  else if (draftMode.value === 'month') period = makePeriod('month', new Date(sel.y, sel.m - 1, 1), now.value);
  else if (draftMode.value === 'year') period = makePeriod('year', new Date(selYear.value, 0, 1), now.value);
  else {
    if (customStart.value > customEnd.value) { showToast('开始时间不能晚于结束时间'); return; }
    period = makeCustomPeriod(customStart.value, customEnd.value);
  }
  emit('confirm', period);
  emit('update:show', false);
}
</script>

<style scoped>
.pp { padding: 16px 16px 24px; }
.pp__head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; margin-bottom: 16px;
}
.pp__summary { font-size: 17px; font-weight: 700; white-space: nowrap; }
.pp__tabs { display: flex; gap: 6px; }
.pp__tab {
  font-size: 14px; color: var(--qz-text-sub); padding: 4px 10px; border-radius: 14px;
}
.pp__tab--active { color: #fff; background: var(--qz-text); font-weight: 600; }
.pp__body { min-height: 200px; }
.pp__body--week { max-height: 320px; overflow-y: auto; text-align: center; }
.pp__nav {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
}
.pp__nav-title { font-size: 24px; font-weight: 700; }
.pp__nav-arrows { display: flex; gap: 24px; font-size: 20px; color: var(--qz-text); }
.pp__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px 8px; }
.pp__cell {
  text-align: center; padding: 10px 0; border-radius: 16px;
  font-size: 16px; color: var(--qz-text);
}
.pp__cell--sel { background: var(--qz-green); color: #fff; }
.pp__cell--future { color: #c8c9cc; }
.pp__week-row { padding: 12px 0; font-size: 17px; color: var(--qz-text-sub); }
.pp__week-row--sel {
  color: var(--qz-text); font-weight: 700; background: var(--qz-tile); border-radius: 12px;
}
.pp__field {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 0; border-bottom: 1px solid var(--qz-line);
}
.pp__field-label { font-size: 16px; font-weight: 600; }
.pp__field-value {
  display: flex; align-items: center; gap: 4px; color: var(--qz-text-sub); font-size: 15px;
}
.pp__footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.pp__btn {
  border: none; border-radius: 18px; padding: 8px 22px; font-size: 15px; cursor: pointer;
}
.pp__btn--cancel { background: var(--qz-tile); color: var(--qz-text); }
.pp__btn--ok { background: var(--qz-green); color: #fff; }
</style>
