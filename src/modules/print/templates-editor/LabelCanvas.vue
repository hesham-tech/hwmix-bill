<template>
  <div class="design-workspace" dir="ltr">
    <div class="stage-container" :style="{ width: `${stageWidth}px`, height: `${stageHeight}px` }">
      <v-stage ref="stage" :config="{ width: stageWidth, height: stageHeight }" @mousedown="background" @touchstart="background">
        <v-layer>
          <v-rect
            :config="{
              x: pad,
              y: pad,
              width: width * unit,
              height: height * unit,
              fill: design.background || '#ffffff',
              shadowColor: '#000',
              shadowBlur: 8,
              shadowOpacity: 0.16,
              name: 'paper',
            }"
          />
          <template v-for="tick in xTicks" :key="`x${tick}`">
            <v-line v-if="rulers" :config="{ points: [pad + tick * unit, pad - 4, pad + tick * unit, pad], stroke: '#64748b', strokeWidth: 1 }" />
            <v-text v-if="rulers" :config="{ x: pad + tick * unit - 8, y: pad - 20, text: String(tick), fontSize: 10, fill: '#64748b' }" />
            <v-line
              v-if="grid && tick > 0 && tick < width"
              :config="{
                points: [pad + tick * unit, pad, pad + tick * unit, pad + height * unit],
                stroke: '#e2e8f0',
                strokeWidth: 1,
                listening: false,
              }"
            />
          </template>
          <template v-for="tick in yTicks" :key="`y${tick}`">
            <v-line v-if="rulers" :config="{ points: [pad - 4, pad + tick * unit, pad, pad + tick * unit], stroke: '#64748b', strokeWidth: 1 }" />
            <v-text v-if="rulers" :config="{ x: 3, y: pad + tick * unit - 5, text: String(tick), fontSize: 10, fill: '#64748b' }" />
            <v-line
              v-if="grid && tick > 0 && tick < height"
              :config="{
                points: [pad, pad + tick * unit, pad + width * unit, pad + tick * unit],
                stroke: '#e2e8f0',
                strokeWidth: 1,
                listening: false,
              }"
            />
          </template>
          <v-rect
            v-if="safeArea"
            :config="{
              x: pad + safeInset * unit,
              y: pad + Number(design.marginMm || 0) * unit,
              width: (width - safeInset * 2) * unit,
              height: (height - 2 * Number(design.marginMm || 0)) * unit,
              stroke: '#f59e0b',
              strokeWidth: 1,
              dash: [5, 4],
              listening: false,
            }"
          />
          <template v-for="element in displayed" :key="element.id">
            <v-image
              v-if="images[element.id]"
              :config="configFor(element)"
              @mousedown="choose(element, $event)"
              @touchstart="choose(element, $event)"
              @dragend="moved(element, $event)"
              @transformend="transformed(element, $event)"
            />
            <v-rect
              v-else
              :config="{
                ...configFor(element),
                fill: element.type === 'row' ? 'rgba(0,136,204,0.025)' : '#fff3cd',
                stroke: '#0088cc',
                strokeWidth: 1,
                dash: element.type === 'row' ? [5, 3] : [],
              }"
              @mousedown="choose(element, $event)"
              @touchstart="choose(element, $event)"
              @dragend="moved(element, $event)"
              @transformend="transformed(element, $event)"
            />
          </template>
          <template v-for="element in displayed.filter(e => selected.includes(e.id))" :key="`label-${element.id}`"
            ><v-text
              :config="{
                x: pad + element.x * unit,
                y: pad + element.y * unit - 14,
                text: element.type === 'row' ? 'صف مرن' : element.field || element.content || element.type,
                fontSize: 10,
                fill: '#0369a1',
                listening: false,
              }"
          /></template>
          <v-transformer
            ref="transformer"
            :config="{
              rotateEnabled: !selected.some(
                id => design.elements.find(e => e.id === id)?.parentId || design.elements.find(e => e.id === id)?.type === 'row'
              ),
              enabledAnchors: selected.some(id => design.elements.find(e => e.id === id)?.parentId)
                ? []
                : ['top-left', 'top-center', 'top-right', 'middle-right', 'bottom-right', 'bottom-center', 'bottom-left', 'middle-left'],
              flipEnabled: false,
              keepRatio: false,
              ignoreStroke: true,
              boundBoxFunc: boundBox,
              anchorSize: 9,
              borderStroke: '#0088cc',
              anchorStroke: '#0088cc',
              rotateAnchorOffset: 24,
            }"
          />
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>
<script setup>
import { computed, ref, shallowRef, watch, nextTick, onBeforeUnmount } from 'vue';
import {
  Stage as VStage,
  Layer as VLayer,
  Rect as VRect,
  Line as VLine,
  Text as VText,
  Image as VImage,
  Transformer as VTransformer,
} from 'vue-konva';
import { renderElement, prepareTemplateLayout } from './templateRenderer';
import { createAssetLoader } from './templateAssets';
const props = defineProps({
  design: { type: Object, required: true },
  values: { type: Object, required: true },
  selected: { type: Array, default: () => [] },
  zoom: { type: Number, default: 1 },
  grid: Boolean,
  rulers: { type: Boolean, default: true },
  snap: Boolean,
  safeArea: Boolean,
  readonly: Boolean,
  geometry: { type: Object, default: undefined },
});
const emit = defineEmits(['select', 'change', 'errors', 'layout']);
const pad = 32,
  stage = ref(),
  transformer = ref(),
  images = shallowRef({});
const width = computed(() => Math.min(210, Math.max(5, Number(props.design.widthMm) || 5))),
  height = computed(() => Math.min(1000, Math.max(5, Number(props.design.heightMm) || 5)));
const unit = computed(() =>
  Math.min(8 * props.zoom, 4096 / Math.max(width.value, height.value), Math.sqrt(4_000_000 / (width.value * height.value)))
);
const stageWidth = computed(() => width.value * unit.value + pad * 2),
  stageHeight = computed(() => height.value * unit.value + pad * 2);
const xTicks = computed(() => Array.from({ length: Math.floor(width.value / 5) + 1 }, (_, i) => i * 5)),
  yTicks = computed(() => Array.from({ length: Math.floor(height.value / 5) + 1 }, (_, i) => i * 5));
const safeInset = computed(() =>
  Math.max(
    Number(props.design.marginMm || 0),
    props.geometry ? Math.max(0, (width.value - (props.geometry.widthDots * 25.4) / props.geometry.dpi) / 2) : 0
  )
);
const loadImage = createAssetLoader();
const resolved = ref(null);
const displayed = computed(() => {
  const items = (resolved.value || props.design).elements.filter(e => e.visible !== false);
  return [...items.filter(e => e.type === 'row'), ...items.filter(e => e.type !== 'row')];
});
let ticket = 0;
function configFor(e) {
  return {
    id: e.id,
    name: 'element',
    x: pad + (Number(e.x) + e.width / 2) * unit.value,
    y: pad + (Number(e.y) + e.height / 2) * unit.value,
    width: e.width * unit.value,
    height: e.height * unit.value,
    offsetX: (e.width * unit.value) / 2,
    offsetY: (e.height * unit.value) / 2,
    rotation: Number(e.rotation || 0),
    image: images.value[e.id],
    draggable: !e.locked && !props.design.elements.find(r => r.id === e.parentId)?.locked && !props.readonly,
  };
}
watch(
  () => [props.design, props.values],
  async () => {
    const current = ++ticket;
    const next = {},
      errors = [];
    let layout;
    try {
      layout = await prepareTemplateLayout(props.design, props.values);
      errors.push(...layout.issues);
    } catch (error) {
      layout = { design: props.design };
      errors.push({ message: error.message });
    }
    if (current !== ticket) return;
    resolved.value = layout.design;
    emit('layout', layout.design);
    await Promise.all(
      layout.design.elements
        .filter(e => e.type !== 'row' && e.visible !== false)
        .map(async e => {
          try {
            next[e.id] = await renderElement(e, props.values, { dpi: 203, loadImage });
            errors.push(...(next[e.id].labelWarnings || []));
          } catch (error) {
            errors.push({ elementId: e.id, message: error.message });
          }
        })
    );
    if (current !== ticket) return;
    images.value = next;
    emit('errors', errors);
    await attach();
  },
  { deep: true, immediate: true }
);
async function attach() {
  await nextTick();
  if (!stage.value || !transformer.value) return;
  const root = stage.value.getNode();
  const nodes = props.selected
    .map(id => root.findOne(n => n.id() === id))
    .filter(n => n && !props.design.elements.find(e => e.id === n.id())?.locked);
  transformer.value.getNode().nodes(nodes);
  transformer.value.getNode().getLayer()?.batchDraw();
}
watch(() => [props.selected, props.zoom, props.design.elements], attach, { deep: true });
function choose(e, event) {
  event.cancelBubble = true;
  const group = e.groupId ? props.design.elements.filter(n => n.groupId === e.groupId).map(n => n.id) : [e.id];
  const multiple = event.evt?.shiftKey || event.evt?.ctrlKey || event.evt?.metaKey;
  emit('select', multiple ? [...new Set([...props.selected, ...group])] : group);
}
function background(event) {
  if (event.target === event.target.getStage() || event.target.name() === 'paper') emit('select', []);
}
function snap(v) {
  return props.snap ? Math.round(v) : Math.round(v * 100) / 100;
}
function moved(e, event) {
  if (e.parentId) {
    const row = props.design.elements.find(r => r.id === e.parentId),
      members = displayed.value
        .filter(n => n.parentId === e.parentId)
        .map(n => ({ ...n, x: n.id === e.id ? (event.target.x() - pad) / unit.value : n.x + n.width / 2 }))
        .sort((a, b) => (row.layout?.direction === 'ltr' ? a.x - b.x : b.x - a.x));
    emit(
      'change',
      props.design.elements.map(n => (n.parentId === e.parentId ? { ...n, order: members.findIndex(m => m.id === n.id) } : n))
    );
    return;
  }
  const node = event.target;
  const x = Math.max(0, snap((node.x() - pad) / unit.value - e.width / 2)),
    y = Math.max(0, snap((node.y() - pad) / unit.value - e.height / 2));
  const dx = x - e.x,
    dy = y - e.y;
  const ids = e.groupId ? props.design.elements.filter(n => n.groupId === e.groupId && !n.locked).map(n => n.id) : [e.id];
  emit(
    'change',
    props.design.elements.map(n =>
      ids.includes(n.id) ? { ...n, x: Math.max(0, snap(Number(n.x) + dx)), y: Math.max(0, snap(Number(n.y) + dy)) } : n
    )
  );
}
function transformed(e, event) {
  if (e.parentId) {
    event.target.scale({ x: 1, y: 1 });
    attach();
    return;
  }
  const node = event.target,
    w = Math.max(0.5, snap((node.width() * node.scaleX()) / unit.value)),
    h = Math.max(0.3, snap((node.height() * node.scaleY()) / unit.value));
  let rotation = ((node.rotation() % 360) + 360) % 360;
  if (e.type === 'row') rotation = 0;
  if (['barcode', 'qr'].includes(e.type)) rotation = (Math.round(rotation / 90) * 90) % 360;
  const x = Math.max(0, snap((node.x() - pad) / unit.value - w / 2)),
    y = Math.max(0, snap((node.y() - pad) / unit.value - h / 2));
  node.scale({ x: 1, y: 1 });
  emit(
    'change',
    props.design.elements.map(n => (n.id === e.id ? { ...n, x, y, width: w, height: h, rotation: Math.round(rotation) } : n))
  );
}
function boundBox(oldBox, newBox) {
  return newBox.width < 4 || newBox.height < 3 ? oldBox : newBox;
}
onBeforeUnmount(() => {
  ++ticket;
});
</script>
<style scoped>
.design-workspace {
  height: 100%;
  min-height: 450px;
  overflow: auto;
  background: #e6edf3;
  display: grid;
  align-items: start;
  justify-items: center;
  padding: 24px;
  border-radius: 10px;
}
.stage-container {
  flex: none;
  touch-action: none;
}
</style>
