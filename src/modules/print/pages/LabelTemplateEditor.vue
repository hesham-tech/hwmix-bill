<template>
  <section ref="editorRoot" class="label-editor">
    <div class="editor-header d-flex align-center ga-3 flex-wrap mb-3">
      <v-btn icon="ri-arrow-right-line" variant="text" aria-label="العودة للقوالب" to="/app/label-templates" />
      <div class="flex-grow-1">
        <h1 class="text-h6">{{ name }}</h1>
        <v-btn
          v-if="template && (permissions.manage || permissions.set_default)"
          variant="text"
          size="small"
          :disabled="saving || publishing || conflict"
          @click="openMetadata"
          >بيانات القالب</v-btn
        >
        <div class="text-caption text-medium-emphasis">{{ statusText }}</div>
      </div>
      <v-btn variant="text" prepend-icon="ri-settings-3-line" @click="openSettings">إعداد الملصق والورق</v-btn>
      <v-menu
        ><template #activator="{ props }"><v-btn v-bind="props" variant="text" prepend-icon="ri-more-2-fill">المزيد</v-btn></template
        ><v-list
          ><v-list-item title="بيانات المعاينة" @click="sampleOpen = true" /><v-list-item title="سجل النسخ" @click="historyOpen = true" /></v-list
      ></v-menu>
      <v-btn variant="tonal" prepend-icon="ri-eye-line" @click="previewOpen = true">معاينة الطباعة</v-btn>
      <v-btn
        v-if="permissions.manage"
        color="primary"
        prepend-icon="ri-save-line"
        :loading="saving"
        :disabled="loading || conflict || !dirty"
        @click="save(false)"
        >حفظ المسودة</v-btn
      >
      <v-btn
        v-if="permissions.publish"
        color="success"
        prepend-icon="ri-send-plane-line"
        :loading="publishing"
        :disabled="loading || saving || conflict || (!template?.has_draft && !dirty)"
        @click="publish"
        >نشر القالب</v-btn
      >
    </div>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-3"
      >{{ error }}<v-btn v-if="conflict" variant="text" @click="exportRecovery">تنزيل تعديلاتك قبل إعادة التحميل</v-btn></v-alert
    >
    <v-alert v-if="!permissions.manage && !loading" type="info" variant="tonal" class="mb-3"
      >وضع المراجعة: يمكنك معاينة المسودة ونشرها حسب صلاحيتك.</v-alert
    >
    <v-progress-linear v-if="loading" indeterminate />
    <div class="editor-toolbar d-flex align-center ga-2 flex-wrap pa-2 border rounded mb-3">
      <v-btn
        size="small"
        variant="text"
        icon="ri-arrow-go-back-line"
        aria-label="تراجع"
        :disabled="!undoStack.length || !permissions.manage"
        @click="undo"
      />
      <v-btn
        size="small"
        variant="text"
        icon="ri-arrow-go-forward-line"
        aria-label="إعادة"
        :disabled="!redoStack.length || !permissions.manage"
        @click="redo"
      />
      <v-divider vertical class="mx-1" />
      <v-btn size="small" variant="text" :disabled="!selected.length || !permissions.manage" @click="duplicateSelection">نسخ العناصر</v-btn>
      <v-btn size="small" variant="text" :disabled="selected.length < 2 || !permissions.manage" @click="groupSelection">تجميع</v-btn>
      <v-btn size="small" variant="text" :disabled="selected.length < 2 || !permissions.manage" @click="createRowFromSelection">وضع داخل صف</v-btn>
      <v-btn size="small" variant="text" :disabled="!selected.length || !permissions.manage" @click="ungroupSelection">فك التجميع</v-btn>
      <v-menu
        ><template #activator="{ props: menuProps }"
          ><v-btn size="small" variant="text" v-bind="menuProps" :disabled="!selected.length || !permissions.manage">محاذاة وتوزيع</v-btn></template
        ><v-list density="compact">
          <v-list-item v-for="a in alignments" :key="a.value" :title="a.title" @click="align(a.value)" />
          <v-list-item title="توزيع أفقي" :disabled="selected.length < 3" @click="distribute('x')" /><v-list-item
            title="توزيع رأسي"
            :disabled="selected.length < 3"
            @click="distribute('y')"
          /> </v-list
      ></v-menu>
      <v-btn
        size="small"
        color="error"
        variant="text"
        icon="ri-delete-bin-line"
        aria-label="حذف العناصر المحددة"
        :disabled="!selected.length || !permissions.manage"
        @click="removeSelection"
      />
      <v-spacer />
      <v-menu :close-on-content-click="false"
        ><template #activator="{ props }"><v-btn v-bind="props" size="small" variant="text">عرض</v-btn></template
        ><v-card class="pa-4"
          ><v-checkbox v-model="grid" label="الشبكة" hide-details /><v-checkbox v-model="rulers" label="المساطر" hide-details /><v-checkbox
            v-model="snap"
            label="التقاط 1 مم"
            hide-details /><v-checkbox v-model="safeArea" label="منطقة الطباعة" hide-details /></v-card
      ></v-menu>
      <v-btn size="small" variant="text" @click="fitCanvas">ملاءمة المساحة</v-btn>
      <v-btn size="small" variant="text" icon="ri-subtract-line" aria-label="تصغير" @click="zoom = Math.max(0.25, zoom - 0.25)" /><span
        class="text-caption"
        >{{ Math.round(zoom * 100) }}%</span
      ><v-btn size="small" variant="text" icon="ri-add-line" aria-label="تكبير" @click="zoom = Math.min(3, zoom + 0.25)" />
    </div>
    <div class="d-flex ga-2 mb-2 flex-wrap">
      <v-spacer /><v-btn size="small" variant="tonal" :color="qualityIssues.length ? 'warning' : undefined" @click="issuesOpen = true"
        >ملاحظات الجودة ({{ qualityIssues.length }})</v-btn
      ><v-btn size="small" variant="text" @click="sampleOpen = true">بيانات المعاينة</v-btn>
    </div>
    <div v-if="!loading" class="editor-layout" :style="panelGridStyle">
      <aside class="editor-panel library-panel" :class="{ 'panel-collapsed': !libraryOpen }">
        <div class="panel-heading">
          <h2>مكتبة العناصر</h2>
          <v-btn
            size="small"
            variant="text"
            :icon="libraryOpen ? 'ri-arrow-right-s-line' : 'ri-arrow-left-s-line'"
            :aria-label="libraryOpen ? 'طي مكتبة العناصر' : 'إظهار مكتبة العناصر'"
            :aria-expanded="libraryOpen"
            @click="libraryOpen = !libraryOpen"
          />
        </div>
        <div v-show="libraryOpen" class="panel-body">
          <v-tabs v-model="leftTab" density="compact" grow><v-tab value="elements">العناصر</v-tab><v-tab value="layers">الطبقات</v-tab></v-tabs>
          <div v-if="leftTab === 'elements'" class="pa-3">
            <div class="element-tools">
              <v-btn
                v-for="tool in tools"
                :key="tool.type"
                variant="tonal"
                size="small"
                :prepend-icon="tool.icon"
                :disabled="!permissions.manage"
                @click="add(tool.type)"
                >{{ tool.title }}</v-btn
              >
            </div>
            <v-divider class="my-4" />
            <h2 class="text-subtitle-2 mb-2">حقول البيانات</h2>
            <v-text-field
              v-model="fieldSearch"
              label="بحث حقول البيانات"
              density="compact"
              placeholder="اسم، سعر، باركود…"
              hide-details
              class="mb-2"
            />
            <v-list density="compact" class="field-list"
              ><v-list-item
                v-for="field in filteredFields"
                :key="field.key"
                :title="field.title"
                :subtitle="field.requiresInvoice ? 'يتطلب سياق فاتورة' : undefined"
                :disabled="!permissions.manage"
                @click="insertField(field)"
                ><template #prepend><v-icon :icon="field.type === 'image' ? 'ri-image-line' : 'ri-text'" size="18" /></template></v-list-item
            ></v-list>
            <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp" hidden @change="uploadImage" />
            <v-btn
              class="mt-3"
              variant="text"
              prepend-icon="ri-upload-2-line"
              :loading="uploading"
              :disabled="!permissions.manage"
              @click="fileInput?.click()"
              >رفع صورة للقالب</v-btn
            >
          </div>
          <div v-else-if="leftTab === 'layers'" class="pa-2">
            <p class="text-caption text-medium-emphasis pa-2">العناصر الأعلى في القائمة تظهر فوق بقية العناصر. استخدم Shift لاختيار أكثر من عنصر.</p>
            <v-list density="compact"
              ><v-list-item
                v-for="element in layerElements"
                :key="element.id"
                :active="selected.includes(element.id)"
                @click="selectLayer(element, $event)"
              >
                <v-list-item-title class="text-body-2">{{ element.parentId ? '↳ ' : '' }}{{ elementTitle(element) }}</v-list-item-title>
                <template #append
                  ><v-btn
                    size="x-small"
                    variant="text"
                    :icon="element.visible === false ? 'ri-eye-off-line' : 'ri-eye-line'"
                    :disabled="!permissions.manage"
                    aria-label="إظهار أو إخفاء العنصر"
                    @click.stop="patchElement(element.id, 'visible', element.visible === false)" /><v-btn
                    size="x-small"
                    variant="text"
                    :icon="element.locked ? 'ri-lock-line' : 'ri-lock-unlock-line'"
                    :disabled="!permissions.manage"
                    aria-label="قفل أو فتح العنصر"
                    @click.stop="patchElement(element.id, 'locked', !element.locked)"
                /></template> </v-list-item
            ></v-list>
            <div class="d-flex ga-1 pa-2">
              <v-btn size="small" variant="tonal" :disabled="selected.length !== 1 || !permissions.manage" @click="reorder(1)">للأمام</v-btn
              ><v-btn size="small" variant="tonal" :disabled="selected.length !== 1 || !permissions.manage" @click="reorder(-1)">للخلف</v-btn>
            </div>
          </div>
        </div>
        <div
          v-if="libraryOpen && viewportWidth > 1000"
          class="panel-resizer library-resizer"
          role="separator"
          tabindex="0"
          aria-label="تغيير عرض مكتبة العناصر"
          aria-orientation="vertical"
          :aria-valuemin="panelMinimum('library')"
          :aria-valuemax="panelMaximum('library')"
          :aria-valuenow="panelWidth('library')"
          @pointerdown="startPanelResize('library', $event)"
          @pointermove="resizePanel"
          @pointerup="stopPanelResize"
          @pointercancel="stopPanelResize"
          @lostpointercapture="stopPanelResize"
          @keydown="resizePanelKeyboard('library', $event)"
        />
      </aside>
      <main ref="canvasPanel" class="canvas-panel">
        <LabelCanvas
          :design="design"
          :values="sampleValues"
          :selected="permissions.manage ? selected : []"
          :zoom="zoom"
          :rulers="rulers"
          :grid="grid"
          :snap="snap"
          :safe-area="safeArea"
          :geometry="printerGeometry"
          :readonly="!permissions.manage"
          @select="permissions.manage && (selected = $event)"
          @change="permissions.manage && (design.elements = $event)"
          @errors="renderErrors = $event"
          @layout="resolvedDesign = $event"
        />
        <div v-if="productId" class="preview-source text-caption mt-2" role="status">
          <template v-if="sampleLoading">جارٍ تحميل بيانات المنتج للمعاينة…</template
          ><template v-else-if="actualValues"
            >معاينة المنتج: {{ actualValues['product.name'] }} · السعر: {{ actualValues['variant.retail_price'] }} · الباركود:
            {{ actualValues['variant.barcode'] }}</template
          ><template v-else>تعذر تحميل المعاينة. افتح بيانات المعاينة لمراجعة السبب.</template>
        </div>
        <v-chip v-if="testContent" color="warning" size="small">معاينة ببيانات اختبارية مؤقتة</v-chip>
        <div class="text-caption text-medium-emphasis mt-2">
          {{ design.widthMm }} × {{ design.heightMm }} مم · الأبعاد مستقلة عن التكبير · الأسهم للتحريك، Shift للحركة الأكبر، Delete للحذف.
        </div>
        <v-alert v-if="geometryError" type="error" variant="tonal" density="compact" class="mt-2">{{ geometryError }}</v-alert>
      </main>
      <aside class="editor-panel properties-panel" :class="{ 'panel-collapsed': !propertiesOpen }">
        <div class="panel-heading">
          <h2>خصائص العنصر</h2>
          <v-btn
            size="small"
            variant="text"
            :icon="propertiesOpen ? 'ri-arrow-left-s-line' : 'ri-arrow-right-s-line'"
            :aria-label="propertiesOpen ? 'طي الخصائص' : 'إظهار الخصائص'"
            :aria-expanded="propertiesOpen"
            @click="propertiesOpen = !propertiesOpen"
          />
        </div>
        <div v-show="propertiesOpen" class="panel-body pa-3">
          <div v-if="active" class="mt-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <h2 class="text-subtitle-2">{{ elementTitle(active) }}</h2>
              <v-btn
                variant="text"
                size="small"
                :icon="active.locked ? 'ri-lock-line' : 'ri-lock-unlock-line'"
                aria-label="قفل أو فتح العنصر"
                :disabled="!permissions.manage"
                @click="patch('locked', !active.locked)"
              />
            </div>
            <template v-if="active.type === 'row'">
              <h3 class="property-heading">تنسيق الصف المرن</h3>
              <v-text-field
                :model-value="active.content || 'صف مرن'"
                label="اسم الصف"
                :disabled="!editable"
                @update:model-value="patch('content', $event)"
              />
              <p class="text-caption mb-3">العناصر داخله ترتب نفسها حسب البيانات الفعلية. لا يتغير موضع بقية الملصق.</p>
              <v-select
                :model-value="active.layout?.mode || 'auto'"
                :items="[
                  { title: 'تلقائي حسب المحتوى', value: 'auto' },
                  { title: 'أعمدة متساوية', value: 'equal' },
                  { title: 'نسب مخصصة', value: 'ratio' },
                ]"
                label="توزيع عرض الصف"
                :disabled="!editable"
                @update:model-value="patchLayout('mode', $event)"
              />
              <v-select
                :model-value="active.layout?.direction || 'rtl'"
                :items="[
                  { title: 'من اليمين', value: 'rtl' },
                  { title: 'من اليسار', value: 'ltr' },
                ]"
                label="اتجاه الصف"
                :disabled="!editable"
                @update:model-value="patchLayout('direction', $event)"
              />
              <v-select
                :model-value="active.layout?.align || 'center'"
                :items="[
                  { title: 'أعلى', value: 'start' },
                  { title: 'وسط', value: 'center' },
                  { title: 'أسفل', value: 'end' },
                ]"
                label="المحاذاة الرأسية"
                :disabled="!editable"
                @update:model-value="patchLayout('align', $event)"
              />
              <v-text-field
                v-for="item in [
                  { key: 'paddingMm', title: 'هامش الصف مم' },
                  { key: 'gapMm', title: 'المسافة بين العناصر مم' },
                  { key: 'rowGapMm', title: 'المسافة بين الأسطر مم' },
                ]"
                :key="item.key"
                :model-value="active.layout?.[item.key] ?? 1"
                :label="item.title"
                type="number"
                min="0"
                step=".1"
                :disabled="!editable"
                @update:model-value="patchLayout(item.key, Number($event))"
              />
              <v-switch
                :model-value="active.layout?.wrap || false"
                label="السماح بأسطر إضافية داخل الصف"
                :disabled="!editable"
                @update:model-value="patchLayout('wrap', $event)"
              />
              <v-select
                v-model="rowInsertId"
                :items="
                  design.elements.filter(e => !e.parentId && e.id !== active.id && ['text', 'image', 'barcode', 'qr'].includes(e.type) && !e.locked)
                "
                :item-title="elementTitle"
                item-value="id"
                label="إضافة عنصر موجود إلى الصف"
              />
              <v-btn :disabled="!editable || !rowInsertId" @click="attachToRow">إضافة للصف</v-btn
              ><v-btn :disabled="!editable" @click="dissolveRow">فك الصف مع الاحتفاظ بالعناصر</v-btn>
            </template>
            <template v-else>
              <v-select
                :model-value="active.parentId || null"
                :items="[
                  { id: null, title: 'عنصر حر' },
                  ...design.elements.filter(e => e.type === 'row').map(e => ({ id: e.id, title: elementTitle(e) })),
                ]"
                item-title="title"
                item-value="id"
                v-if="['text', 'barcode', 'qr', 'image'].includes(active.type)"
                label="الصف الحاوي"
                :disabled="!editable"
                @update:model-value="changeParent($event)"
              />
              <template v-if="active.parentId"
                ><p class="text-caption">اسحب العنصر داخل الصف لتغيير ترتيبه؛ موضعه وعرضه يحسبان تلقائيًا.</p>
                <v-text-field
                  :model-value="active.flexWeight || 1"
                  label="نسبة العرض داخل الصف"
                  type="number"
                  min=".1"
                  :disabled="!editable"
                  @update:model-value="patch('flexWeight', Number($event))"
                /><v-btn size="small" @click="moveInRow(-1)">قبل</v-btn><v-btn size="small" @click="moveInRow(1)">بعد</v-btn></template
              >
            </template>
            <template v-if="active.type === 'text' && priceField(active)">
              <h3 class="property-heading">تنسيق السعر</h3>
              <p class="text-caption">تنسيق العرض فقط؛ لا يغير قيمة السعر في المنتج.</p>
              <v-btn v-if="!active.priceFormat" :disabled="!editable" @click="enablePriceFormat">تفعيل تنسيق السعر وتحويل العملة الثابتة</v-btn>
              <template v-else
                ><v-text-field
                  :model-value="active.priceFormat.decimals"
                  label="عدد المنازل العشرية"
                  type="number"
                  min="0"
                  max="6"
                  :disabled="!editable"
                  @update:model-value="patchPrice('decimals', Number($event))"
                />
                <v-switch
                  v-for="item in [
                    { key: 'showCurrency', title: 'إظهار العملة' },
                    { key: 'trimZeros', title: 'إخفاء الأصفار العشرية الزائدة' },
                    { key: 'groupThousands', title: 'فاصل الآلاف' },
                  ]"
                  :key="item.key"
                  :model-value="active.priceFormat[item.key]"
                  :label="item.title"
                  :disabled="!editable"
                  @update:model-value="patchPrice(item.key, $event)"
                />
                <v-text-field
                  :model-value="active.priceFormat.currencySymbol"
                  label="رمز العملة (فارغ لاستخدام عملة الشركة)"
                  maxlength="20"
                  :disabled="!editable || !active.priceFormat.showCurrency"
                  @update:model-value="patchPrice('currencySymbol', $event)"
                />
                <v-select
                  :model-value="active.priceFormat.currencyPosition"
                  :items="[
                    { title: 'قبل السعر', value: 'before' },
                    { title: 'بعد السعر', value: 'after' },
                  ]"
                  label="موضع العملة"
                  :disabled="!editable || !active.priceFormat.showCurrency"
                  @update:model-value="patchPrice('currencyPosition', $event)"
                />
                <p class="text-caption">القيمة الأصلية: {{ sampleValues[priceField(active)] }}<br />العرض: {{ priceExample }}</p></template
              >
            </template>
            <h3 class="property-heading">الموضع والأبعاد</h3>
            <p class="text-caption mb-3">الموضع من أعلى يسار الملصق؛ الأبعاد بالملليمتر والدوران بالدرجات.</p>
            <div class="property-grid">
              <v-text-field
                v-for="p in elementNumbers"
                :key="p.key"
                :model-value="active[p.key] || 0"
                :label="p.title"
                type="number"
                :step="p.key === 'rotation' && ['barcode', 'qr'].includes(active.type) ? 90 : 0.1"
                density="compact"
                :disabled="!editable || !!active.parentId || (active.type === 'row' && p.key === 'rotation')"
                @update:model-value="patch(p.key, Number($event))"
              />
            </div>
            <h3 class="property-heading">المحتوى وخياراته</h3>
            <template v-if="active.type === 'text'">
              <v-textarea
                :model-value="active.content"
                label="النص والحقول {{product.name}}"
                rows="3"
                auto-grow
                :disabled="!editable"
                @update:model-value="patch('content', $event)"
              />
              <v-select
                :model-value="active.align"
                :items="[
                  { title: 'يمين', value: 'right' },
                  { title: 'وسط', value: 'center' },
                  { title: 'يسار', value: 'left' },
                ]"
                label="المحاذاة"
                density="compact"
                :disabled="!editable"
                @update:model-value="patch('align', $event)"
              />
              <v-select
                :model-value="active.direction"
                :items="[
                  { title: 'تلقائي', value: 'auto' },
                  { title: 'عربي RTL', value: 'rtl' },
                  { title: 'إنجليزي LTR', value: 'ltr' },
                ]"
                label="اتجاه النص"
                density="compact"
                :disabled="!editable"
                @update:model-value="patch('direction', $event)"
              />
              <v-select
                :model-value="active.overflow"
                :items="[
                  { title: 'تصغير حتى الحد الأدنى ثم …', value: 'shrink' },
                  { title: 'اختصار بعلامة …', value: 'ellipsis' },
                ]"
                label="عند زيادة النص"
                density="compact"
                :disabled="!editable"
                @update:model-value="patch('overflow', $event)"
              />
              <div class="property-grid">
                <v-text-field
                  v-for="p in [
                    { key: 'minFontSize', title: 'أقل حجم خط pt' },
                    { key: 'lineHeight', title: 'تباعد الأسطر' },
                  ]"
                  :key="p.key"
                  :model-value="active[p.key]"
                  :label="p.title"
                  type="number"
                  step=".1"
                  density="compact"
                  :disabled="!editable"
                  @update:model-value="patch(p.key, Number($event))"
                />
              </div>
              <v-select
                :model-value="active.valueFormat || 'text'"
                :items="[
                  { title: 'كما هي', value: 'text' },
                  { title: 'رقم', value: 'number' },
                  { title: 'سعر بمنزلتين', value: 'money' },
                  { title: 'تاريخ', value: 'date' },
                ]"
                label="تنسيق القيم"
                density="compact"
                :disabled="!editable"
                @update:model-value="patch('valueFormat', $event)"
              />
            </template>
            <template v-if="['barcode', 'qr', 'image'].includes(active.type)">
              <v-select
                :model-value="active.field || null"
                :items="active.type === 'image' ? fields.filter(f => f.type === 'image') : fields.filter(f => f.type !== 'image')"
                item-title="title"
                item-value="key"
                clearable
                label="مصدر البيانات"
                density="compact"
                :disabled="!editable"
                @update:model-value="patch('field', $event || '')"
              />
              <v-textarea
                v-if="active.type !== 'image' && !active.field"
                :model-value="active.content"
                label="قيمة ثابتة"
                rows="2"
                :disabled="!editable"
                @update:model-value="patch('content', $event)"
              />
              <v-select
                v-if="active.type === 'barcode'"
                :model-value="active.format || 'CODE128'"
                :items="['CODE128', 'EAN13', 'EAN8', 'UPC']"
                label="نوع الباركود"
                density="compact"
                :disabled="!editable"
                @update:model-value="patch('format', $event)"
              />
              <v-switch
                v-if="active.type === 'barcode'"
                :model-value="active.showText !== false"
                label="إظهار أرقام الباركود"
                density="compact"
                :disabled="!editable"
                @update:model-value="patch('showText', $event)"
              />
            </template>
            <h3 class="property-heading">الشكل والخط</h3>
            <template v-if="['text', 'barcode'].includes(active.type)">
              <v-select
                :model-value="active.fontFamily || 'Tahoma'"
                :items="fonts"
                label="الخط"
                density="compact"
                :disabled="!editable"
                @update:model-value="patch('fontFamily', $event)"
              />
              <v-text-field
                :model-value="active.fontSize"
                type="number"
                min="3"
                max="150"
                step=".25"
                label="حجم الخط بالنقاط pt"
                density="compact"
                :disabled="!editable"
                @update:model-value="patch('fontSize', Number($event))"
              />
              <v-switch
                :model-value="active.bold"
                label="خط عريض"
                density="compact"
                :disabled="!editable"
                @update:model-value="patch('bold', $event)"
              />
            </template>
            <h3 class="property-heading">خيارات متقدمة</h3>
            <template v-if="active.type === 'text'"
              ><v-text-field
                :model-value="active.prefix"
                label="نص قبل المحتوى"
                density="compact"
                :disabled="!editable"
                @update:model-value="patch('prefix', $event)" /><v-text-field
                :model-value="active.suffix"
                label="نص بعد المحتوى"
                density="compact"
                :disabled="!editable"
                @update:model-value="patch('suffix', $event)"
            /></template>
            <div v-if="!['barcode', 'qr', 'image'].includes(active.type)" class="d-flex ga-4 align-center mb-3">
              <label class="text-caption"
                >اللون
                <input :value="active.color || '#000000'" type="color" :disabled="!editable" @input="patch('color', $event.target.value)" /></label
              ><label v-if="['rect', 'ellipse'].includes(active.type)" class="text-caption"
                >التعبئة <input :value="active.fill || '#ffffff'" type="color" :disabled="!editable" @input="patch('fill', $event.target.value)"
              /></label>
            </div>
            <v-text-field
              v-if="['rect', 'ellipse', 'line'].includes(active.type)"
              :model-value="active.strokeWidth || 0.3"
              type="number"
              step=".1"
              min=".05"
              label="سمك الخط مم"
              density="compact"
              :disabled="!editable"
              @update:model-value="patch('strokeWidth', Number($event))"
            />
          </div>
          <div v-else class="text-body-2 text-medium-emphasis pa-5 text-center">اختر عنصرًا من الملصق أو الطبقات لعرض خصائصه.</div>
        </div>
        <div
          v-if="propertiesOpen && viewportWidth > 1000"
          class="panel-resizer properties-resizer"
          role="separator"
          tabindex="0"
          aria-label="تغيير عرض الخصائص"
          aria-orientation="vertical"
          :aria-valuemin="panelMinimum('properties')"
          :aria-valuemax="panelMaximum('properties')"
          :aria-valuenow="panelWidth('properties')"
          @pointerdown="startPanelResize('properties', $event)"
          @pointermove="resizePanel"
          @pointerup="stopPanelResize"
          @pointercancel="stopPanelResize"
          @lostpointercapture="stopPanelResize"
          @keydown="resizePanelKeyboard('properties', $event)"
        />
      </aside>
    </div>
    <v-dialog v-model="previewOpen" max-width="760"
      ><v-card title="معاينة الإخراج الفعلي"
        ><v-card-text>
          <div class="d-flex ga-4 flex-wrap mb-3">
            <v-switch v-model="monochrome" label="إخراج حراري أبيض وأسود" density="compact" hide-details /><v-switch
              v-model="usePrinterBounds"
              label="تطبيق حدود الطابعة"
              density="compact"
              hide-details
            />
          </div>
          <TemplatePreview
            :key="`${companyId}-${template?.id || 'new'}`"
            :design="design"
            :values="sampleValues"
            :monochrome="monochrome"
            :geometry="usePrinterBounds ? printerGeometry : undefined"
            :max-height="600"
          />
          <p class="text-caption mt-3">المعاينة تستخدم محرك الطباعة نفسه. راجع وضوح الرمز بمقاسه الحقيقي بعد أول طباعة.</p> </v-card-text
        ><v-card-actions><v-spacer /><v-btn @click="previewOpen = false">إغلاق</v-btn></v-card-actions></v-card
      ></v-dialog
    >
    <v-dialog v-model="restoreOpen" max-width="440"
      ><v-card title="استعادة إصدار سابق"
        ><v-card-text>ستُنسخ النسخة المختارة إلى مسودة، وتبقى النسخة المنشورة الحالية مستخدمة حتى تنشر المسودة.</v-card-text
        ><v-card-actions
          ><v-spacer /><v-btn @click="restoreOpen = false">إلغاء</v-btn><v-btn color="primary" @click="restore">استعادة كمسودة</v-btn></v-card-actions
        ></v-card
      ></v-dialog
    >

    <TemplateMetadataDialog :target="metadataTarget" :permissions="permissions" @close="metadataTarget = null" @saved="metadataSaved" />
    <v-dialog :model-value="settingsOpen" max-width="900" @update:model-value="!$event && closeSettings()"
      ><v-card title="إعداد الملصق والورق"
        ><v-card-text
          ><v-tabs v-model="settingsTab"
            ><v-tab value="label">الملصق</v-tab><v-tab value="sheet">توزيع A4</v-tab><v-tab value="bounds">حدود المعاينة</v-tab></v-tabs
          >
          <div class="settings-layout">
            <div class="settings-fields">
              <div v-show="settingsTab === 'label'">
                <v-select
                  :items="[
                    { title: '50 × 60 مم', value: 60 },
                    { title: '50 × 30 مم', value: 30 },
                    { title: '50 × 20 مم', value: 20 },
                  ]"
                  label="مقاس جاهز"
                  density="compact"
                  :disabled="!permissions.manage"
                  @update:model-value="settingsSize(50, $event)"
                />
                <div class="property-grid">
                  <v-text-field
                    v-for="p in documentNumbers"
                    :key="p.key"
                    :model-value="settingsDesign[p.key]"
                    :label="p.title"
                    type="number"
                    min="0"
                    step=".1"
                    density="compact"
                    :disabled="!permissions.manage"
                    @update:model-value="settingsDesign[p.key] = Number($event)"
                  />
                </div>
                <v-btn
                  variant="tonal"
                  block
                  class="mb-3"
                  :disabled="!permissions.manage"
                  @click="settingsSize(settingsDesign.heightMm, settingsDesign.widthMm)"
                  >تبديل الاتجاه</v-btn
                >
                <label class="text-caption"
                  >لون الخلفية
                  <input
                    :value="settingsDesign.background"
                    type="color"
                    :disabled="!permissions.manage"
                    @input="settingsDesign.background = $event.target.value"
                /></label>
              </div>
              <div v-show="settingsTab === 'sheet'">
                <v-divider class="my-4" />
                <h2 class="text-subtitle-2 mb-3">شبكة أوراق A4</h2>
                <v-select
                  :model-value="settingsDesign.sheet.orientation || 'portrait'"
                  :items="[
                    { title: 'A4 رأسي', value: 'portrait' },
                    { title: 'A4 أفقي', value: 'landscape' },
                  ]"
                  label="اتجاه الورقة"
                  density="compact"
                  :disabled="!permissions.manage"
                  @update:model-value="settingsDesign.sheet.orientation = $event"
                />
                <v-select
                  :model-value="settingsDesign.sheet.direction || 'ltr'"
                  :items="[
                    { title: 'من اليسار إلى اليمين', value: 'ltr' },
                    { title: 'من اليمين إلى اليسار', value: 'rtl' },
                  ]"
                  label="ترتيب خانات الملصقات"
                  density="compact"
                  :disabled="!permissions.manage"
                  @update:model-value="settingsDesign.sheet.direction = $event"
                />
                <div class="property-grid">
                  <v-text-field
                    v-for="p in sheetNumbers"
                    :key="p.key"
                    :model-value="
                      settingsDesign.sheet[p.key] ??
                      (p.key === 'marginRight'
                        ? settingsDesign.sheet.marginLeft
                        : p.key === 'marginBottom'
                          ? settingsDesign.sheet.marginTop
                          : undefined)
                    "
                    :label="p.title"
                    type="number"
                    min="0"
                    step=".1"
                    density="compact"
                    :disabled="!permissions.manage"
                    @update:model-value="settingsDesign.sheet[p.key] = Number($event)"
                  />
                </div>
                <v-alert v-if="settingsSheetError" type="warning" variant="tonal" density="compact">{{ settingsSheetError }}</v-alert>
              </div>
              <div v-show="settingsTab === 'bounds'">
                <v-divider class="my-4" />
                <h2 class="text-subtitle-2 mb-2">إظهار حدود طابعة فعلية</h2>
                <v-text-field v-model.number="settingsWidth" type="number" label="عرض رأس الطابعة بالنقاط" density="compact" /><v-text-field
                  v-model.number="settingsDpi"
                  type="number"
                  label="دقة الطابعة DPI"
                  density="compact"
                />
                <p class="text-caption text-medium-emphasis">قيم العرض للمراجعة فقط. الطباعة تستخدم مواصفات الطابعة التي تختارها وقت الطلب.</p>
              </div>
            </div>
            <div>
              <div v-if="settingsTab === 'sheet'" class="sheet-mini-preview">
                <svg
                  :viewBox="`0 0 ${settingsPage.width} ${settingsPage.height}`"
                  role="img"
                  aria-label="معاينة توزيع الملصقات على A4"
                  style="max-height: 360px; width: 100%"
                >
                  <rect x="0" y="0" :width="settingsPage.width" :height="settingsPage.height" fill="white" stroke="#94a3b8" />
                  <rect
                    v-for="cell in settingsPage.cells"
                    :key="cell.i"
                    :x="cell.x"
                    :y="cell.y"
                    :width="settingsDesign.widthMm"
                    :height="settingsDesign.heightMm"
                    fill="#e0f2fe"
                    stroke="#0284c7"
                    stroke-width=".4"
                  />
                </svg>
                <p class="text-caption">توزيع الخانات على ورقة A4؛ معاينة محتوى الملصق في تبويب الملصق.</p>
              </div>
              <TemplatePreview
                v-else
                :design="settingsDesign"
                :values="sampleValues"
                :geometry="
                  settingsTab === 'bounds' && settingsWidth > 0 && settingsDpi > 0 ? { widthDots: settingsWidth, dpi: settingsDpi } : undefined
                "
                :max-height="360"
              />
              <p class="text-caption mt-3">معاينة مؤقتة. لن تتغير المسودة حتى تضغط تطبيق.</p>
            </div>
          </div>
          <v-alert v-if="settingsError" type="error" variant="tonal">{{ settingsError }}</v-alert></v-card-text
        ><v-card-actions
          ><v-spacer /><v-btn @click="closeSettings">إلغاء</v-btn
          ><v-btn v-if="permissions.manage" color="primary" @click="applySettings">تطبيق</v-btn></v-card-actions
        ></v-card
      ></v-dialog
    >
    <v-dialog v-model="discardSettings" max-width="420"
      ><v-card title="تجاهل إعدادات غير مطبقة؟"
        ><v-card-text>لم تتغير المسودة. يمكنك العودة لإكمال الإعدادات.</v-card-text
        ><v-card-actions
          ><v-spacer /><v-btn @click="discardSettings = false">العودة للتعديل</v-btn
          ><v-btn
            color="error"
            @click="
              discardSettings = false;
              settingsOpen = false;
            "
            >تجاهل</v-btn
          ></v-card-actions
        ></v-card
      ></v-dialog
    >
    <v-dialog v-model="sampleOpen" max-width="520"
      ><v-card title="بيانات المعاينة"
        ><v-card-text>
          <div class="pa-3">
            <v-switch v-model="testContent" label="وضع اختبار المحتوى (لا يُحفظ داخل القالب)" />
            <template v-if="testContent"
              ><v-btn size="small" @click="setTestPreset('large')">أسعار كبيرة</v-btn
              ><v-btn size="small" @click="setTestPreset('fractions')">كسور عشرية</v-btn
              ><v-btn size="small" @click="longSample = true">اسم طويل</v-btn><v-btn size="small" @click="setTestPreset('missing')">قيم ناقصة</v-btn
              ><v-text-field v-for="key in usedFields" :key="key" v-model="testValues[key]" :label="fields.find(f => f.key === key)?.title || key"
            /></template>
            <h2 class="text-subtitle-2 mb-3">معاينة بمنتج حقيقي</h2>
            <v-autocomplete
              v-model="productId"
              :items="products"
              item-title="name"
              item-value="id"
              label="ابحث عن منتج"
              :loading="searching"
              clearable
              density="compact"
              @update:search="searchProducts"
              @update:model-value="loadProduct"
            />
            <v-select
              v-if="variants.length"
              v-model="variantId"
              :items="variants"
              item-title="sku"
              item-value="id"
              label="المتغير"
              density="compact"
              @update:model-value="changeSampleVariant"
            />
            <v-select
              v-if="units.length"
              v-model="unitId"
              :items="units"
              item-title="name"
              item-value="id"
              label="الوحدة"
              density="compact"
              @update:model-value="loadActualSample"
            />
            <v-alert v-if="actualValues && productId" type="info" variant="tonal" density="compact" class="my-3"
              ><strong>{{ actualValues['product.name'] }}</strong>
              <div>السعر: {{ actualValues['variant.retail_price'] }} · الباركود: {{ actualValues['variant.barcode'] }}</div>
              <template v-if="!hasProductNameField"
                ><p class="mt-2">القالب لا يحتوي حقل اسم المنتج. اختيار المنتج يغير بيانات الحقول الموجودة فقط؛ «اسم الشركة» يبقى اسم الشركة.</p>
                <v-btn
                  v-if="permissions.manage"
                  variant="text"
                  size="small"
                  @click="
                    add('text', 'product.name');
                    sampleOpen = false;
                  "
                  >إضافة اسم المنتج للملصق</v-btn
                ></template
              ></v-alert
            >
            <v-btn v-if="productId" variant="text" :loading="sampleLoading" @click="loadActualSample">تحديث بيانات المنتج</v-btn>
            <v-alert v-if="sampleError" type="warning" variant="tonal" density="compact">{{ sampleError }}</v-alert>
            <p class="text-caption text-medium-emphasis my-3">
              {{
                productId ? 'المعاينة تستخدم البيانات المتاحة لك حاليًا.' : 'المعاينة تستخدم بيانات تجريبية، ولا تُحفظ أسعار المنتجات داخل القالب.'
              }}
            </p>
            <v-switch v-model="longSample" label="اختبار اسم طويل" density="compact" hide-details />
          </div> </v-card-text
        ><v-card-actions><v-spacer /><v-btn @click="sampleOpen = false">إغلاق</v-btn></v-card-actions></v-card
      ></v-dialog
    >
    <v-dialog v-model="historyOpen" max-width="520"
      ><v-card title="سجل النسخ المنشورة"
        ><v-card-text
          ><p class="text-body-2">الاستعادة تنشئ مسودة ولا تغيّر النسخة المستخدمة للطباعة حتى نشرها.</p>
          <v-divider class="my-4" />
          <v-select
            v-if="template?.revisions?.length"
            v-model="restoreId"
            :items="template.revisions"
            :item-title="r => `الإصدار ${r.version}`"
            item-value="id"
            label="النسخ المنشورة السابقة"
            density="compact"
          />
          <v-btn v-if="template?.revisions?.length && permissions.manage" variant="tonal" :disabled="!restoreId || dirty" @click="restoreOpen = true"
            >استعادة كمسودة</v-btn
          >
          <p v-if="!template?.revisions?.length" class="my-4">لم يُنشر هذا القالب بعد.</p></v-card-text
        ><v-card-actions><v-spacer /><v-btn @click="historyOpen = false">إغلاق</v-btn></v-card-actions></v-card
      ></v-dialog
    >
    <v-dialog v-model="issuesOpen" max-width="600"
      ><v-card title="ملاحظات جودة التصميم"
        ><v-card-text
          ><p v-if="!qualityIssues.length">لا توجد ملاحظات حاليًا. يظل اختبار القراءة بعد الطباعة ضروريًا.</p>
          <v-list
            ><v-list-item
              v-for="(issue, i) in qualityIssues"
              :key="i"
              :title="issue.message"
              :subtitle="issue.elementId ? 'اضغط لتحديد العنصر ومراجعة خصائصه' : 'راجع إعداد الملصق والورق أو بيانات المعاينة'"
              @click="focusIssue(issue)"
              ><template #append
                ><template v-if="issue.elementIds && permissions.manage"
                  ><v-btn
                    size="small"
                    @click.stop="
                      selected = issue.elementIds;
                      createRowFromSelection();
                      issuesOpen = false;
                    "
                    >وضع في صف</v-btn
                  ><v-btn size="small" @click.stop="approveOverlap(issue)">اعتماد التداخل</v-btn
                  ><v-btn
                    size="small"
                    @click.stop="
                      selected = issue.elementIds;
                      equalWidths();
                    "
                    >مساواة العرض</v-btn
                  ></template
                ></template
              ></v-list-item
            ></v-list
          ></v-card-text
        ><v-card-actions><v-spacer /><v-btn @click="issuesOpen = false">إغلاق</v-btn></v-card-actions></v-card
      ></v-dialog
    >
    <EditorHelp ref="helpGuide" :root="editorRoot" />
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { labelTemplateService as api, labelError } from '../templates-editor/labelTemplate.service';
import { createStarterDesign, newElement, clone, SAMPLE_VALUES, validateDesign, validateSheet, FONTS } from '../templates-editor/templateSchema';
import { priceField, isMoneyField, defaultPriceFormat, formatPrice } from '../templates-editor/priceFormat';
import { renderTemplate } from '../templates-editor/templateRenderer';
import { createAssetLoader } from '../templates-editor/templateAssets';
import LabelCanvas from '../templates-editor/LabelCanvas.vue';
import TemplatePreview from '../components/TemplatePreview.vue';
import TemplateMetadataDialog from '../components/TemplateMetadataDialog.vue';
import EditorHelp from '../templates-editor/EditorHelp.vue';
const route = useRoute(),
  router = useRouter(),
  user = useUserStore();
const companyCurrency = ref('');
const companyId = computed(() => user.currentCompany?.id);
const design = ref(createStarterDesign()),
  name = ref('قالب ملصقات جديد'),
  template = ref(null),
  fields = ref([]),
  fonts = ref(FONTS),
  permissions = ref({}),
  loading = ref(true),
  saving = ref(false),
  publishing = ref(false),
  conflict = ref(false),
  error = ref(''),
  ready = ref(false),
  saved = ref('');
const selected = ref([]),
  leftTab = ref('elements'),
  rulers = ref(true),
  fieldSearch = ref(''),
  grid = ref(true),
  snap = ref(true),
  safeArea = ref(true),
  zoom = ref(1),
  renderErrors = ref([]),
  previewOpen = ref(false),
  monochrome = ref(true),
  usePrinterBounds = ref(false),
  printerWidth = ref(384),
  printerDpi = ref(203),
  undoStack = ref([]),
  redoStack = ref([]);
const productId = ref(null),
  products = ref([]),
  variants = ref([]),
  variantId = ref(null),
  unitId = ref(null),
  units = ref([]),
  actualValues = ref(null),
  sampleError = ref(''),
  sampleLoading = ref(false),
  searching = ref(false),
  longSample = ref(false),
  restoreId = ref(null),
  restoreOpen = ref(false),
  fileInput = ref(),
  uploading = ref(false);
let autosaveTimer,
  searchTimer,
  sampleTicket = 0,
  replaying = false,
  disposed = false;
const serialized = computed(() => JSON.stringify({ design: design.value }));
const dirty = computed(() => ready.value && (!template.value || serialized.value !== saved.value));
const statusText = computed(() =>
  conflict.value
    ? 'تعارض تعديل — تعديلاتك محفوظة في هذه الصفحة'
    : saving.value
      ? 'جارٍ حفظ المسودة…'
      : dirty.value
        ? 'تعديلات غير محفوظة'
        : template.value?.has_draft
          ? 'المسودة محفوظة · لن تظهر في الطباعة حتى نشرها'
          : template.value?.published
            ? `جميع التغييرات محفوظة · الإصدار ${template.value.published.version} منشور${template.value.is_default ? ' · الافتراضي للشركة' : ''}`
            : 'مسودة غير منشورة'
);
const layerElements = computed(() =>
  design.value.elements
    .filter(e => !e.parentId)
    .reverse()
    .flatMap(e =>
      e.type === 'row' ? [e, ...design.value.elements.filter(n => n.parentId === e.id).sort((a, b) => (a.order || 0) - (b.order || 0))] : [e]
    )
);
const active = computed(() => design.value.elements.find(e => e.id === selected.value[0]));
const editable = computed(
  () => permissions.value.manage && active.value && !active.value.locked && !design.value.elements.find(e => e.id === active.value.parentId)?.locked
);
const sampleValues = computed(() => ({
  ...((productId.value ? actualValues.value : null) || (!productId.value ? SAMPLE_VALUES : {})),
  'company.currency': companyCurrency.value,
  ...(testContent.value ? testValues.value : {}),
  ...(longSample.value ? { 'product.name': 'منتج تجريبي باسم عربي طويل لاختبار التفاف النص ومحاذاته وحجمه داخل مساحة الملصق' } : {}),
}));
const filteredFields = computed(() => fields.value.filter(f => f.title.includes(fieldSearch.value) || f.key.includes(fieldSearch.value)));
const printerGeometry = computed(() =>
  Number(printerWidth.value) > 0 && Number(printerDpi.value) > 0
    ? { widthDots: Number(printerWidth.value), dpi: Number(printerDpi.value) }
    : undefined
);
const geometryError = computed(() => {
  try {
    validateDesign(design.value, { allowEmpty: true });
    return '';
  } catch (e) {
    return e.message;
  }
});
const tools = [
  { type: 'row', title: 'صف مرن', icon: 'ri-layout-row-line' },
  { type: 'text', title: 'نص', icon: 'ri-text' },
  { type: 'barcode', title: 'باركود', icon: 'ri-barcode-line' },
  { type: 'qr', title: 'QR', icon: 'ri-qr-code-line' },
  { type: 'image', title: 'صورة', icon: 'ri-image-line' },
  { type: 'line', title: 'خط', icon: 'ri-subtract-line' },
  { type: 'rect', title: 'إطار', icon: 'ri-checkbox-blank-line' },
  { type: 'ellipse', title: 'دائرة', icon: 'ri-checkbox-blank-circle-line' },
];
const documentNumbers = [
  { key: 'widthMm', title: 'العرض مم' },
  { key: 'heightMm', title: 'الطول مم' },
  { key: 'marginMm', title: 'الهامش مم' },
];
const sheetNumbers = [
  { key: 'columns', title: 'الأعمدة' },
  { key: 'rows', title: 'الصفوف' },
  { key: 'marginLeft', title: 'الهامش الأيسر مم' },
  { key: 'marginRight', title: 'الهامش الأيمن مم' },
  { key: 'marginTop', title: 'الهامش العلوي مم' },
  { key: 'marginBottom', title: 'الهامش السفلي مم' },
  { key: 'gapX', title: 'فاصل أفقي مم' },
  { key: 'gapY', title: 'فاصل رأسي مم' },
];
const elementNumbers = [
  { key: 'x', title: 'الموضع X مم' },
  { key: 'y', title: 'الموضع Y مم' },
  { key: 'width', title: 'العرض مم' },
  { key: 'height', title: 'الارتفاع مم' },
  { key: 'rotation', title: 'الدوران °' },
];
const alignments = [
  { title: 'محاذاة لليسار', value: 'left' },
  { title: 'توسيط أفقي', value: 'center' },
  { title: 'محاذاة لليمين', value: 'right' },
  { title: 'محاذاة لأعلى', value: 'top' },
  { title: 'توسيط رأسي', value: 'middle' },
  { title: 'محاذاة لأسفل', value: 'bottom' },
];
const loadImage = createAssetLoader();

const helpGuide = ref(null);
const editorRoot = ref(null),
  canvasPanel = ref(null),
  libraryOpen = ref(true),
  propertiesOpen = ref(true),
  sampleOpen = ref(false),
  historyOpen = ref(false),
  issuesOpen = ref(false),
  metadataTarget = ref(null);
const settingsOpen = ref(false),
  settingsDesign = ref(createStarterDesign()),
  settingsWidth = ref(384),
  settingsDpi = ref(203),
  settingsTab = ref('label'),
  settingsError = ref(''),
  discardSettings = ref(false);
let settingsInitial = '',
  resizeObserver;
const settingsSnapshot = () => JSON.stringify([settingsDesign.value, settingsWidth.value, settingsDpi.value]);
const settingsPage = computed(() => {
  const d = settingsDesign.value,
    s = d.sheet,
    columns = Math.max(1, Math.min(30, Math.floor(Number(s.columns) || 1))),
    rows = Math.max(1, Math.min(60, Math.floor(Number(s.rows) || 1)));
  return {
    width: s.orientation === 'landscape' ? 297 : 210,
    height: s.orientation === 'landscape' ? 210 : 297,
    cells: Array.from({ length: rows * columns }, (_, i) => ({
      i,
      x: Number(s.marginLeft) + (i % columns) * (Number(d.widthMm) + Number(s.gapX)),
      y: Number(s.marginTop) + Math.floor(i / columns) * (Number(d.heightMm) + Number(s.gapY)),
    })),
  };
});
const settingsSheetError = computed(() => {
  try {
    validateSheet(settingsDesign.value);
    return '';
  } catch (e) {
    return e.message;
  }
});
const qualityIssues = computed(() => [
  ...design.value.elements
    .filter(e => e.visible !== false && ['text', 'barcode'].includes(e.type) && Number(e.fontSize || 9) < 7)
    .map(e => ({ message: `${elementTitle(e)}: حجم الخط أقل من 7 نقاط وقد يقل وضوحه حراريًا.`, elementId: e.id })),
  ...renderErrors.value.map(issue => (typeof issue === 'string' ? { message: issue } : issue)),
  ...(geometryError.value ? [{ message: geometryError.value }] : []),
]);
function focusIssue(issue) {
  if (issue.elementId) {
    selected.value = issue.elementIds || [issue.elementId];
    propertiesOpen.value = true;
    issuesOpen.value = false;
  } else {
    issuesOpen.value = false;
    openSettings();
  }
}
function openSettings() {
  settingsDesign.value = clone(design.value);
  settingsWidth.value = printerWidth.value;
  settingsDpi.value = printerDpi.value;
  settingsInitial = settingsSnapshot();
  settingsError.value = '';
  settingsOpen.value = true;
}
function closeSettings() {
  if (settingsSnapshot() !== settingsInitial) discardSettings.value = true;
  else settingsOpen.value = false;
}
function settingsSize(w, h) {
  settingsDesign.value = { ...settingsDesign.value, widthMm: Number(w), heightMm: Number(h) };
}
function applySettings() {
  try {
    validateDesign(settingsDesign.value, { allowEmpty: true, allowOverflow: true });
    if (!(settingsWidth.value > 0 && settingsDpi.value > 0)) throw Error('أدخل عرضًا ودقة موجبين لحدود المعاينة.');
    design.value = clone(settingsDesign.value);
    printerWidth.value = settingsWidth.value;
    printerDpi.value = settingsDpi.value;
    settingsOpen.value = false;
    nextTick(fitCanvas);
  } catch (e) {
    settingsError.value = e.message;
  }
}
async function openMetadata() {
  if (dirty.value && !(await save())) return;
  if (template.value) metadataTarget.value = template.value;
}
function metadataSaved(result) {
  template.value = { ...template.value, ...result };
  name.value = result.name;
  metadataTarget.value = null;
}
const viewportWidth = ref(window.innerWidth),
  panelWidths = ref({ library: 0, properties: 0 });
const hasProductNameField = computed(() =>
  design.value.elements.some(e => e.visible !== false && (e.field === 'product.name' || (e.content || '').includes('{{product.name}}')))
);
function panelMinimum(which) {
  return which === 'library' ? (viewportWidth.value <= 1280 ? 220 : 230) : viewportWidth.value <= 1280 ? 260 : 280;
}
function panelMaximum(which) {
  const other = which === 'library' ? 'properties' : 'library',
    otherOpen = other === 'library' ? libraryOpen.value : propertiesOpen.value;
  return Math.max(
    panelMinimum(which),
    Math.min(
      520,
      (editorRoot.value?.clientWidth || viewportWidth.value) -
        32 -
        300 -
        28 -
        (otherOpen ? Math.max(panelMinimum(other), Math.min(520, panelWidths.value[other] || panelMinimum(other))) : 42)
    )
  );
}
function panelWidth(which) {
  const isOpen = which === 'library' ? libraryOpen.value : propertiesOpen.value;
  return isOpen ? Math.max(panelMinimum(which), Math.min(panelMaximum(which), panelWidths.value[which] || panelMinimum(which))) : 42;
}
const panelGridStyle = computed(() =>
  viewportWidth.value > 1000 ? { gridTemplateColumns: `${panelWidth('library')}px minmax(300px,1fr) ${panelWidth('properties')}px` } : {}
);
let panelDrag = null;
function resizeSign(which) {
  const rtl = getComputedStyle(editorRoot.value).direction === 'rtl';
  return which === 'library' ? (rtl ? -1 : 1) : rtl ? 1 : -1;
}
function startPanelResize(which, event) {
  if (event.button !== 0) return;
  event.preventDefault();
  event.currentTarget.setPointerCapture(event.pointerId);
  panelDrag = { which, x: event.clientX, width: panelWidth(which), sign: resizeSign(which) };
  editorRoot.value.classList.add('resizing-panel');
}
function resizePanel(event) {
  if (!panelDrag) return;
  const { which, x, width, sign } = panelDrag;
  panelWidths.value = {
    ...panelWidths.value,
    [which]: Math.max(panelMinimum(which), Math.min(panelMaximum(which), width + (event.clientX - x) * sign)),
  };
  nextTick(fitCanvas);
}
function stopPanelResize() {
  panelDrag = null;
  editorRoot.value?.classList.remove('resizing-panel');
}
function resizePanelKeyboard(which, event) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  event.stopPropagation();
  const target =
    event.key === 'Home'
      ? panelMinimum(which)
      : event.key === 'End'
        ? panelMaximum(which)
        : panelWidth(which) + (event.key === 'ArrowRight' ? 1 : -1) * resizeSign(which) * (event.shiftKey ? 40 : 10);
  panelWidths.value = { ...panelWidths.value, [which]: Math.max(panelMinimum(which), Math.min(panelMaximum(which), target)) };
  nextTick(fitCanvas);
}
function viewportChanged() {
  viewportWidth.value = window.innerWidth;
  stopPanelResize();
  nextTick(fitCanvas);
}
function fitCanvas() {
  const node = canvasPanel.value;
  if (!node) return;
  const available = Math.max(180, window.innerHeight - node.getBoundingClientRect().top - 55);
  editorRoot.value?.style.setProperty('--editor-panel-height', `${available}px`);
  zoom.value = Math.max(
    0.1,
    Math.min(3, (node.clientWidth - 90) / (8 * Number(design.value.widthMm)), (available - 64) / (8 * Number(design.value.heightMm)))
  );
}
watch([libraryOpen, propertiesOpen], () => nextTick(fitCanvas));
function queueAutosave() {
  clearTimeout(autosaveTimer);
  if (!ready.value || !template.value?.id || !permissions.value.manage || conflict.value || saving.value || publishing.value || !dirty.value) return;
  autosaveTimer = setTimeout(() => save(true), 1500);
}
watch(
  () => JSON.stringify(design.value),
  (current, previous) => {
    if (!ready.value) return;
    if (!replaying && previous) {
      undoStack.value.push(previous);
      if (undoStack.value.length > 100) undoStack.value.shift();
      redoStack.value = [];
    }
    queueAutosave();
  },
  { flush: 'sync' }
);

async function load() {
  loading.value = true;
  ready.value = false;
  error.value = '';
  try {
    const meta = await api.fields();
    fields.value = meta.data;
    companyCurrency.value = meta.currency_symbol || '';
    permissions.value = meta.permissions;
    fonts.value = meta.fonts;
    if (route.params.id && route.params.id !== 'new') {
      template.value = await api.get(route.params.id);
      design.value = clone((template.value.draft || template.value.published).design);
      name.value = template.value.name;
    }
    saved.value = serialized.value;
    undoStack.value = [];
    redoStack.value = [];
    ready.value = true;
  } catch (e) {
    error.value = labelError(e);
  } finally {
    loading.value = false;
    await nextTick();
    fitCanvas();
  }
}
async function save(automatic = false) {
  if (!permissions.value.manage || saving.value || conflict.value || !dirty.value) return false;
  clearTimeout(autosaveTimer);
  const captured = serialized.value,
    payload = { ...(!template.value ? { name: name.value } : {}), design: clone(design.value), lock_version: template.value?.lock_version };
  saving.value = true;
  error.value = '';
  try {
    const result = template.value ? await api.save(template.value.id, payload) : await api.create(payload);
    if (disposed || companyId.value !== result.company_id) return false;
    template.value = result;
    saved.value = captured;
    if (!route.params.id || route.params.id === 'new') await router.replace(`/app/label-templates/${result.id}/edit`);
    return true;
  } catch (e) {
    error.value = labelError(e);
    if (e.response?.status === 409) conflict.value = true;
    return false;
  } finally {
    saving.value = false;
    if (!automatic || !error.value) queueAutosave();
  }
}
async function publish() {
  if (publishing.value) return;
  publishing.value = true;
  clearTimeout(autosaveTimer);
  error.value = '';
  try {
    if (dirty.value && (!permissions.value.manage || !(await save()))) return;
    validateDesign(design.value);
    if (sampleError.value) throw Error(sampleError.value);
    await renderTemplate(design.value, sampleValues.value, { loadImage });
    template.value = await api.publish(template.value.id, template.value.lock_version);
    saved.value = serialized.value;
  } catch (e) {
    error.value = labelError(e);
    if (e.response?.status === 409) conflict.value = true;
  } finally {
    publishing.value = false;
    queueAutosave();
  }
}
const resolvedDesign = ref(null),
  rowInsertId = ref(null),
  testContent = ref(false),
  testValues = ref({});
const usedFields = computed(() =>
  [
    ...new Set(design.value.elements.flatMap(e => (e.field ? [e.field] : [...(e.content || '').matchAll(/\{\{([\w.-]+)\}\}/g)].map(m => m[1])))),
  ].filter(k => fields.value.some(f => f.key === k))
);
watch(testContent, enabled => {
  if (enabled) {
    const source = (productId.value ? actualValues.value : SAMPLE_VALUES) || {};
    testValues.value = Object.fromEntries(usedFields.value.map(k => [k, source[k] ?? '']));
  } else {
    testValues.value = {};
    longSample.value = false;
  }
});
const priceExample = computed(() => {
  if (!active.value?.priceFormat) return '';
  try {
    return formatPrice(sampleValues.value[priceField(active.value)], active.value.priceFormat, sampleValues.value);
  } catch (e) {
    return e.message;
  }
});
function setTestPreset(kind) {
  testValues.value = Object.fromEntries(
    usedFields.value.map((key, i) => [
      key,
      kind === 'missing'
        ? ''
        : isMoneyField(key)
          ? kind === 'large'
            ? String(99999 + i * 1000)
            : '1500.755'
          : sampleValues.value[key] || 'قيمة تجريبية',
    ])
  );
}
function patchPrice(key, value) {
  patch('priceFormat', { ...active.value.priceFormat, [key]: value });
}
function enablePriceFormat() {
  const e = active.value,
    pattern = /(?<![\p{L}\p{N}])(?:ج\.?\s*م|جنيه مصري)(?![\p{L}\p{N}])/gu;
  const symbol = [e.content, e.prefix, e.suffix].filter(Boolean).join(' ').match(pattern)?.[0] || '';
  design.value = {
    ...design.value,
    schemaVersion: 2,
    elements: design.value.elements.map(n =>
      n.id === e.id
        ? {
            ...n,
            priceFormat: { ...defaultPriceFormat(), currencySymbol: symbol.trim() },
            content: (n.content || '').replace(pattern, '').trim(),
            prefix: (n.prefix || '').replace(pattern, '').trim(),
            suffix: (n.suffix || '').replace(pattern, '').trim(),
          }
        : n
    ),
  };
}
function patchLayout(key, value) {
  patch('layout', { ...active.value.layout, [key]: value });
}
function newRow() {
  return {
    ...newElement('row'),
    content: `صف مرن ${design.value.elements.filter(e => e.type === 'row').length + 1}`,
    width: Math.max(5, design.value.widthMm - 6),
    height: 12,
    x: 3,
    y: 3,
    layout: { paddingMm: 1, gapMm: 1, rowGapMm: 1, direction: 'rtl', mode: 'auto', wrap: false, align: 'center' },
  };
}
function addRow() {
  const row = newRow();
  design.value = { ...design.value, schemaVersion: 2, elements: [...design.value.elements, row] };
  selected.value = [row.id];
}
function createRowFromSelection() {
  const chosen = selectedEditable().filter(e => ['text', 'barcode', 'qr', 'image'].includes(e.type) && !e.parentId);
  if (chosen.length < 2) {
    error.value = 'اختر عنصرين حرّين غير مقفلين على الأقل.';
    return;
  }
  const row = newRow();
  row.x = Math.max(0, Math.min(...chosen.map(e => e.x)) - 1);
  row.y = Math.max(0, Math.min(...chosen.map(e => e.y)) - 1);
  row.width = Math.min(design.value.widthMm - row.x, Math.max(...chosen.map(e => e.x + e.width)) - row.x + 1);
  row.height = Math.min(design.value.heightMm - row.y, Math.max(...chosen.map(e => e.height)) + 2);
  const ids = chosen.map(e => e.id);
  design.value = {
    ...design.value,
    schemaVersion: 2,
    elements: [
      row,
      ...design.value.elements.map(e => (ids.includes(e.id) ? { ...e, parentId: row.id, order: ids.indexOf(e.id), rotation: 0, groupId: null } : e)),
    ],
  };
  selected.value = [row.id];
}
function changeParent(id) {
  const e = active.value;
  if (!e) return;
  const actual = resolvedDesign.value?.elements.find(n => n.id === e.id) || e;
  design.value = {
    ...design.value,
    schemaVersion: 2,
    elements: design.value.elements.map(n =>
      n.id === e.id
        ? {
            ...n,
            parentId: id || null,
            order: design.value.elements.filter(m => m.parentId === id).length,
            rotation: 0,
            ...(!id ? { x: actual.x, y: actual.y, width: actual.width } : {}),
          }
        : n
    ),
  };
}
function attachToRow() {
  const row = active.value;
  if (!row || !rowInsertId.value) return;
  design.value.elements = design.value.elements.map(e =>
    e.id === rowInsertId.value
      ? { ...e, parentId: row.id, rotation: 0, groupId: null, order: design.value.elements.filter(n => n.parentId === row.id).length }
      : e
  );
  rowInsertId.value = null;
}
function dissolveRow() {
  const id = active.value.id;
  design.value.elements = design.value.elements
    .filter(e => e.id !== id)
    .map(e =>
      e.parentId === id
        ? {
            ...e,
            ...Object.fromEntries(['x', 'y', 'width'].map(k => [k, resolvedDesign.value?.elements.find(n => n.id === e.id)?.[k] ?? e[k]])),
            parentId: null,
          }
        : e
    );
  selected.value = [];
}
function moveInRow(delta) {
  const e = active.value,
    members = design.value.elements.filter(n => n.parentId === e.parentId).sort((a, b) => (a.order || 0) - (b.order || 0)),
    index = members.findIndex(n => n.id === e.id),
    target = Math.max(0, Math.min(members.length - 1, index + delta));
  [members[index], members[target]] = [members[target], members[index]];
  design.value.elements = design.value.elements.map(n => (n.parentId === e.parentId ? { ...n, order: members.findIndex(m => m.id === n.id) } : n));
}
function approveOverlap(issue) {
  design.value = {
    ...design.value,
    overlapApprovals: [...(design.value.overlapApprovals || []).filter(a => a.key !== issue.key), { key: issue.key, signature: issue.signature }],
  };
}
function equalWidths() {
  const chosen = selectedEditable();
  if (!chosen.length) return;
  const width = Math.min(...chosen.map(e => e.width));
  design.value.elements = design.value.elements.map(e => (selected.value.includes(e.id) && !e.locked ? { ...e, width } : e));
}
function add(type, field = '') {
  if (!permissions.value.manage) return;
  if (type === 'row') {
    addRow();
    return;
  }
  const element = newElement(type, field);
  if (type === 'text' && isMoneyField(field)) {
    design.value.schemaVersion = 2;
    element.priceFormat = defaultPriceFormat();
  }
  element.width = Math.min(element.width, Math.max(1, design.value.widthMm - 8));
  element.height = Math.min(element.height, Math.max(1, design.value.heightMm - 8));
  design.value.elements = [...design.value.elements, element];
  selected.value = [element.id];
}
function insertField(field) {
  if (field.type === 'image') {
    add('image', field.key);
    return;
  }
  if (isMoneyField(field.key)) {
    add('text', field.key);
    return;
  }
  if (active.value?.type === 'text' && editable.value) patch('content', `${active.value.content || ''}{{${field.key}}}`);
  else add('text', field.key);
}
function patchElement(id, key, value) {
  if (!permissions.value.manage) return;
  design.value.elements = design.value.elements.map(e => (e.id === id ? { ...e, [key]: value } : e));
}
function patch(key, value) {
  if (active.value) patchElement(active.value.id, key, value);
}
function selectLayer(element, event) {
  if (event?.shiftKey || event?.ctrlKey || event?.metaKey)
    selected.value = selected.value.includes(element.id) ? selected.value.filter(id => id !== element.id) : [...selected.value, element.id];
  else selected.value = [element.id];
}
function elementTitle(e) {
  if (e.type === 'row') return e.content || 'صف مرن';
  return e.type === 'text'
    ? (e.content || 'نص').slice(0, 45)
    : e.type === 'image'
      ? e.field || 'صورة مرفوعة'
      : e.type === 'barcode'
        ? 'باركود'
        : e.type === 'qr'
          ? 'QR'
          : e.type === 'line'
            ? 'خط'
            : e.type === 'rect'
              ? 'إطار'
              : 'دائرة';
}
function selectedEditable() {
  return design.value.elements.filter(
    e => selected.value.includes(e.id) && !e.locked && !design.value.elements.find(r => r.id === e.parentId)?.locked
  );
}
function duplicateSelection() {
  const originals = selectedEditable();
  const rows = originals.filter(e => e.type === 'row').map(e => e.id);
  const all = design.value.elements.filter(e => originals.some(n => n.id === e.id) || rows.includes(e.parentId));
  const mapping = Object.fromEntries(all.map(e => [e.id, crypto.randomUUID()]));
  design.value.elements = [
    ...design.value.elements,
    ...all.map(e => ({ ...clone(e), id: mapping[e.id], parentId: mapping[e.parentId] || e.parentId || null, x: e.x + 1, y: e.y + 1, groupId: null })),
  ];
  selected.value = originals.map(e => mapping[e.id]);
}
function removeSelection() {
  const ids = selectedEditable().map(e => e.id);
  design.value.elements = design.value.elements.filter(e => !ids.includes(e.id) && !ids.includes(e.parentId));
  selected.value = [];
}
function groupSelection() {
  const id = crypto.randomUUID();
  design.value.elements = design.value.elements.map(e => (selected.value.includes(e.id) && !e.locked ? { ...e, groupId: id } : e));
}
function ungroupSelection() {
  design.value.elements = design.value.elements.map(e => (selected.value.includes(e.id) && !e.locked ? { ...e, groupId: null } : e));
}
function reorder(delta) {
  const items = [...design.value.elements],
    i = items.findIndex(e => e.id === selected.value[0]),
    target = Math.max(0, Math.min(items.length - 1, i + delta));
  if (i < 0) return;
  const [item] = items.splice(i, 1);
  items.splice(target, 0, item);
  design.value.elements = items;
}
function align(type) {
  const chosen = selectedEditable();
  if (!chosen.length) return;
  const many = chosen.length > 1;
  const minX = many ? Math.min(...chosen.map(e => Number(e.x))) : Number(design.value.marginMm),
    maxX = many ? Math.max(...chosen.map(e => Number(e.x) + Number(e.width))) : design.value.widthMm - Number(design.value.marginMm);
  const minY = many ? Math.min(...chosen.map(e => Number(e.y))) : Number(design.value.marginMm),
    maxY = many ? Math.max(...chosen.map(e => Number(e.y) + Number(e.height))) : design.value.heightMm - Number(design.value.marginMm);
  const ids = chosen.map(e => e.id);
  design.value.elements = design.value.elements.map(e => {
    if (!ids.includes(e.id)) return e;
    const patch = {};
    if (type === 'left') patch.x = minX;
    if (type === 'right') patch.x = maxX - e.width;
    if (type === 'center') patch.x = (minX + maxX - e.width) / 2;
    if (type === 'top') patch.y = minY;
    if (type === 'bottom') patch.y = maxY - e.height;
    if (type === 'middle') patch.y = (minY + maxY - e.height) / 2;
    return { ...e, ...patch };
  });
}
function distribute(axis) {
  const size = axis === 'x' ? 'width' : 'height',
    chosen = selectedEditable().sort((a, b) => a[axis] - b[axis]);
  if (chosen.length < 3) return;
  const start = Number(chosen[0][axis]),
    end = Number(chosen.at(-1)[axis]) + Number(chosen.at(-1)[size]),
    gap = (end - start - chosen.reduce((sum, e) => sum + Number(e[size]), 0)) / (chosen.length - 1);
  if (gap < 0) {
    error.value = 'لا توجد مساحة كافية لتوزيع العناصر دون تداخل.';
    return;
  }
  let position = start;
  const values = {};
  for (const e of chosen) {
    values[e.id] = position;
    position += Number(e[size]) + gap;
  }
  design.value.elements = design.value.elements.map(e => (e.id in values ? { ...e, [axis]: values[e.id] } : e));
}
function undo() {
  if (!undoStack.value.length) return;
  replaying = true;
  redoStack.value.push(JSON.stringify(design.value));
  design.value = JSON.parse(undoStack.value.pop());
  replaying = false;
}
function redo() {
  if (!redoStack.value.length) return;
  replaying = true;
  undoStack.value.push(JSON.stringify(design.value));
  design.value = JSON.parse(redoStack.value.pop());
  replaying = false;
}
function keys(event) {
  if (document.querySelector('.v-dialog.v-overlay--active')) return;
  if (
    settingsOpen.value ||
    metadataTarget.value ||
    sampleOpen.value ||
    historyOpen.value ||
    previewOpen.value ||
    issuesOpen.value ||
    restoreOpen.value
  )
    return;
  const target = event.target;
  if (target?.closest?.('input,textarea,[contenteditable=true]') || previewOpen.value || !permissions.value.manage) return;
  const mod = event.ctrlKey || event.metaKey;
  if (mod && event.key.toLowerCase() === 's') {
    event.preventDefault();
    save();
    return;
  }
  if (mod && event.key.toLowerCase() === 'z') {
    event.preventDefault();
    event.shiftKey ? redo() : undo();
    return;
  }
  if (mod && event.key.toLowerCase() === 'y') {
    event.preventDefault();
    redo();
    return;
  }
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault();
    removeSelection();
    return;
  }
  if (!selected.value.length || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
  event.preventDefault();
  const step = event.shiftKey ? 1 : 0.1,
    dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0,
    dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
  design.value.elements = design.value.elements.map(e =>
    selected.value.includes(e.id) && !e.locked
      ? { ...e, x: Math.max(0, Math.round((Number(e.x) + dx) * 100) / 100), y: Math.max(0, Math.round((Number(e.y) + dy) * 100) / 100) }
      : e
  );
}
async function uploadImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  uploading.value = true;
  try {
    const result = await api.upload(file);
    if (active.value?.type !== 'image') add('image');
    patch('mediaId', result.id);
    patch('field', '');
  } catch (e) {
    error.value = labelError(e);
  } finally {
    uploading.value = false;
    event.target.value = '';
  }
}
function searchProducts(query) {
  clearTimeout(searchTimer);
  if (!query || query.length < 2) return;
  searchTimer = setTimeout(async () => {
    searching.value = true;
    try {
      products.value = await api.products({ search: query });
    } catch (e) {
      sampleError.value = labelError(e);
    } finally {
      searching.value = false;
    }
  }, 400);
}
async function loadProduct() {
  const current = ++sampleTicket,
    selectedProduct = productId.value,
    company = companyId.value;
  testContent.value = false;
  longSample.value = false;
  variants.value = [];
  units.value = [];
  unitId.value = null;
  variantId.value = null;
  actualValues.value = null;
  sampleError.value = '';
  sampleLoading.value = !!selectedProduct;
  if (!selectedProduct) return;
  try {
    const [product] = await api.products({ ids: [selectedProduct] });
    if (disposed || current !== sampleTicket || company !== companyId.value) return;
    if (!product || Number(product.id) !== Number(selectedProduct)) throw Error('بيانات المنتج المستلمة لا تطابق الاختيار. أعد البحث.');
    variants.value = product.variants || [];
    variantId.value = variants.value[0]?.id;
    if (!variantId.value) throw Error('لا يوجد متغير متاح لهذا المنتج للمعاينة.');
    await loadActualSample();
  } catch (e) {
    if (current === sampleTicket) sampleError.value = labelError(e);
  } finally {
    if (current === sampleTicket) sampleLoading.value = false;
  }
}
async function changeSampleVariant() {
  unitId.value = null;
  units.value = [];
  await loadActualSample();
}
async function loadActualSample() {
  const current = ++sampleTicket,
    selectedVariant = variantId.value,
    selectedProduct = productId.value,
    company = companyId.value;
  sampleLoading.value = !!selectedVariant;
  sampleError.value = '';
  actualValues.value = null;
  if (!selectedVariant) return;
  try {
    const result = await api.preview({
      design: clone(design.value),
      items: [{ variant_id: selectedVariant, unit_id: unitId.value || undefined, quantity: 1 }],
    });
    if (disposed || current !== sampleTicket || company !== companyId.value || selectedProduct !== productId.value) return;
    const record = result.records?.[0];
    if (!record?.values) throw Error('لم تصل بيانات المنتج للمعاينة.');
    if (record.variant_id && Number(record.variant_id) !== Number(selectedVariant)) throw Error('بيانات المعاينة لا تطابق المتغير المختار.');
    actualValues.value = record.values;
    units.value = record.units || [];
    unitId.value = record.unit_id;
  } catch (e) {
    if (current === sampleTicket) sampleError.value = labelError(e);
  } finally {
    if (current === sampleTicket) sampleLoading.value = false;
  }
}
async function restore() {
  try {
    template.value = await api.restore(template.value.id, restoreId.value, template.value.lock_version);
    replaying = true;
    design.value = clone(template.value.draft.design);
    replaying = false;
    saved.value = serialized.value;
    restoreOpen.value = false;
  } catch (e) {
    error.value = labelError(e);
  }
}
function exportRecovery() {
  const blob = new Blob([serialized.value], { type: 'application/json' }),
    url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = 'label-draft-recovery.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function beforeUnload(event) {
  if (dirty.value || (settingsOpen.value && settingsSnapshot() !== settingsInitial)) {
    event.preventDefault();
    event.returnValue = '';
  }
}
onBeforeRouteLeave(async to => {
  if (settingsOpen.value && settingsSnapshot() !== settingsInitial && !window.confirm('توجد إعدادات غير مطبقة. هل تريد المغادرة وتجاهلها؟'))
    return false;
  if (to.path === `/app/label-templates/${template.value?.id}/edit` && route.params.id === 'new') return true;
  if (!dirty.value) return true;
  if (!conflict.value && permissions.value.manage && (await save())) return true;
  return window.confirm('توجد تعديلات غير محفوظة. هل تريد المغادرة وفقدها؟');
});
watch(companyId, async (current, previous) => {
  testContent.value = false;
  testValues.value = {};
  resolvedDesign.value = null;
  if (previous && current !== previous) {
    clearTimeout(autosaveTimer);
    ++sampleTicket;
    ready.value = false;
    design.value = createStarterDesign();
    actualValues.value = null;
    template.value = null;
    await router.replace('/app/label-templates');
  }
});
onMounted(() => {
  load();
  window.addEventListener('resize', viewportChanged);
  resizeObserver = new ResizeObserver(() => fitCanvas());
  if (editorRoot.value) resizeObserver.observe(editorRoot.value);
  window.addEventListener('keydown', keys);
  window.addEventListener('beforeunload', beforeUnload);
});
onBeforeUnmount(() => {
  disposed = true;
  resizeObserver?.disconnect();
  window.removeEventListener('resize', viewportChanged);
  stopPanelResize();
  clearTimeout(autosaveTimer);
  clearTimeout(searchTimer);
  window.removeEventListener('keydown', keys);
  window.removeEventListener('beforeunload', beforeUnload);
});
</script>
<style scoped>
.label-editor {
  background: rgb(var(--v-theme-background));
  min-height: 100dvh;
  padding: 16px;
}
.label-editor :deep(.v-btn--disabled) {
  pointer-events: auto;
}
.editor-header {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.14);
  padding-bottom: 12px;
}
.property-heading {
  font-size: 13px;
  font-weight: 700;
  margin: 18px 0 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(var(--v-border-color), 0.14);
}
.settings-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 20px;
  align-items: start;
}
.settings-fields {
  min-width: 0;
}
@media (max-width: 650px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }
  .label-editor {
    padding: 8px;
  }
}

.editor-layout {
  display: grid;
  grid-template-columns: 230px minmax(280px, 1fr) 280px;
  gap: 14px;
  align-items: start;
}
.editor-panel {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 10px;
  background: rgb(var(--v-theme-surface));
  max-height: var(--editor-panel-height, calc(100dvh - 265px));
  overflow: visible;
  box-shadow: 0 3px 14px rgba(15, 45, 70, 0.09);
  position: sticky;
  top: 12px;
}
.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  min-height: 48px;
  padding: 4px 8px;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.15);
  background: rgba(var(--v-theme-primary), 0.045);
  border-radius: 10px 10px 0 0;
}
.panel-heading h2 {
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
}
.panel-body {
  max-height: calc(var(--editor-panel-height, calc(100dvh - 265px)) - 49px);
  overflow: auto;
}
.panel-collapsed .panel-heading {
  padding: 4px;
  justify-content: center;
  border-bottom: 0;
  border-radius: 10px;
}
.panel-collapsed .panel-heading h2 {
  display: none;
}
.panel-resizer {
  position: absolute;
  top: 48px;
  bottom: 0;
  width: 10px;
  cursor: col-resize;
  touch-action: none;
  z-index: 3;
  border-radius: 5px;
}
.panel-resizer::after {
  content: '';
  position: absolute;
  inset: 0 3px;
  background: rgba(var(--v-theme-primary), 0.16);
  border-radius: 3px;
}
.panel-resizer:hover::after,
.panel-resizer:focus-visible::after {
  background: rgb(var(--v-theme-primary));
}
.library-resizer {
  inset-inline-end: -6px;
}
.properties-resizer {
  inset-inline-start: -6px;
}
.resizing-panel {
  cursor: col-resize;
  user-select: none;
}
.preview-source {
  padding: 7px 10px;
  background: rgba(var(--v-theme-primary), 0.06);
  border-radius: 6px;
}
.canvas-panel {
  min-width: 0;
}
.canvas-panel :deep(.design-workspace) {
  max-height: var(--editor-panel-height, calc(100dvh - 265px));
}
.element-tools {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.property-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.field-list {
  max-height: 360px;
  overflow: auto;
}
input[type='color'] {
  width: 38px;
  height: 28px;
  border: 1px solid #bbb;
  border-radius: 5px;
  vertical-align: middle;
  margin-inline-start: 6px;
}
@media (max-width: 1280px) {
  .editor-layout {
    grid-template-columns: 220px minmax(300px, 1fr) 260px;
  }
}
@media (max-width: 1000px) {
  .editor-layout {
    grid-template-columns: 220px minmax(280px, 1fr);
  }
  .editor-panel:last-child {
    grid-column: 1/-1;
    position: static;
    max-height: none;
  }
  .editor-panel:last-child .property-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 650px) {
  .editor-layout {
    display: flex;
    flex-direction: column;
  }
  .editor-panel,
  .canvas-panel {
    width: 100%;
    position: static;
    max-height: none;
  }
  .editor-panel:first-child {
    max-height: 380px;
  }
  .editor-toolbar {
    gap: 2px !important;
  }
}
</style>
