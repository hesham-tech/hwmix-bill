<template>
  <div class="ai-models-page pa-4">
    <!-- إحصائيات علوية -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-card class="bg-white elevation-1 rounded-xl border pa-4">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-subtitle-1 text-grey-darken-1 mb-1">إجمالي النماذج</div>
              <div class="text-h4 font-weight-bold text-primary">{{ totalModels }}</div>
            </div>
            <v-avatar color="primary-lighten-4" size="56" rounded="lg">
              <v-icon color="primary" size="32">ri-robot-2-line</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="bg-white elevation-1 rounded-xl border pa-4">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-subtitle-1 text-grey-darken-1 mb-1">النماذج النشطة</div>
              <div class="text-h4 font-weight-bold text-success">{{ activeModels }}</div>
            </div>
            <v-avatar color="success-lighten-4" size="56" rounded="lg">
              <v-icon color="success" size="32">ri-check-line</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="bg-white elevation-1 rounded-xl border pa-4">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-subtitle-1 text-grey-darken-1 mb-1">الشركات المتاحة</div>
              <div class="text-h4 font-weight-bold text-info">{{ providers.length }}</div>
            </div>
            <v-avatar color="info-lighten-4" size="56" rounded="lg">
              <v-icon color="info" size="32">ri-building-line</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- AppDataTable المكون المشترك المعتمد بالنظام -->
    <AppDataTable
      table-key="ai_models.index"
      v-model:search="search"
      :headers="headers"
      :items="filteredModels"
      :loading="loading"
      title="إدارة نماذج الذكاء الاصطناعي (AI Models)"
      subtitle="عرض وتعديل وتفعيل النماذج المسجلة في المنصة وتخصيص التعرفات والتعاملات"
      icon="ri-robot-line"
      searchable
    >
      <!-- زر إضافة نموذج جديد -->
      <template #actions>
        <div class="d-flex gap-2">
          <v-select
            v-model="selectedProvider"
            :items="providers"
            item-title="label"
            item-value="id"
            label="تصفية حسب المزود"
            variant="outlined"
            density="compact"
            hide-details
            style="min-width: 200px"
            clearable
          ></v-select>

          <AppButton
            color="primary"
            prepend-icon="ri-add-line"
            class="rounded-lg font-weight-bold"
            @click="openAddDialog"
          >
            إضافة نموذج جديد
          </AppButton>
        </div>
      </template>

      <!-- Custom Column Slots -->
      <template #item.label="{ item }">
        <span class="font-weight-bold text-high-emphasis">{{ item.label }}</span>
      </template>

      <template #item.model_id="{ item }">
        <code class="text-caption text-primary bg-grey-lighten-4 px-2 py-1 rounded">{{ item.model_id }}</code>
      </template>

      <template #item.provider.label="{ item }">
        <v-chip size="small" color="secondary" variant="flat">
          {{ item.provider ? item.provider.label : 'غير محدد' }}
        </v-chip>
      </template>

      <template #item.is_active="{ item }">
        <v-chip
          :color="item.is_active ? 'success' : 'error'"
          size="small"
          class="font-weight-medium"
        >
          {{ item.is_active ? 'نشط' : 'معطل' }}
        </v-chip>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex gap-2 justify-end">
          <v-btn
            icon
            variant="text"
            color="primary"
            size="small"
            @click="openEditDialog(item)"
            title="تعديل"
          >
            <v-icon>ri-pencil-line</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="text"
            :color="item.is_active ? 'warning' : 'success'"
            size="small"
            @click="toggleModelActive(item)"
            :title="item.is_active ? 'تعطيل' : 'تفعيل'"
            :loading="togglingId === item.id"
          >
            <v-icon>{{ item.is_active ? 'ri-shut-down-line' : 'ri-play-circle-line' }}</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="text"
            color="error"
            size="small"
            @click="confirmDelete(item)"
            title="حذف"
          >
            <v-icon>ri-delete-bin-line</v-icon>
          </v-btn>
        </div>
      </template>
    </AppDataTable>

    <!-- إضافة/تعديل Modal -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card class="rounded-xl border">
        <v-card-title class="pa-4 border-b bg-primary text-white">
          <span class="text-h6 font-weight-bold text-white">{{ isEditing ? 'تعديل النموذج' : 'إضافة نموذج جديد' }}</span>
          <v-btn icon="ri-close-line" variant="text" size="small" class="float-left text-white" @click="closeDialog"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4 pt-6">
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.ai_provider_id"
                  :items="providers"
                  item-title="label"
                  item-value="id"
                  label="المزود (Provider)"
                  variant="outlined"
                  :rules="[v => !!v || 'المزود مطلوب']"
                  rounded="lg"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.label"
                  label="اسم النموذج (Label)"
                  variant="outlined"
                  :rules="[v => !!v || 'الاسم مطلوب']"
                  rounded="lg"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-combobox
                  v-model="editedItem.model_id"
                  :items="modelSuggestions"
                  label="معرف النموذج الرسمي (Model ID)"
                  variant="outlined"
                  hint="اختر من القوائم الرسمية أو اكتب المعرف التقني المقدم من شركة الذكاء الاصطناعي (مثل: gemini-1.5-pro أو gpt-4o)"
                  persistent-hint
                  :rules="[v => !!v || 'المعرف مطلوب']"
                  rounded="lg"
                ></v-combobox>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="editedItem.max_context_tokens"
                  label="الحد الأقصى للسياق (Max Context Tokens)"
                  type="number"
                  variant="outlined"
                  rounded="lg"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editedItem.input_price_per_1k"
                  label="سعر 1k Tokens للدخل ($)"
                  type="number"
                  step="0.0001"
                  variant="outlined"
                  rounded="lg"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editedItem.output_price_per_1k"
                  label="سعر 1k Tokens للخرج ($)"
                  type="number"
                  step="0.0001"
                  variant="outlined"
                  rounded="lg"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="editedItem.is_active"
                  label="النموذج نشط"
                  color="success"
                  hide-details
                ></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4 border-t bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDialog" class="rounded-lg px-4">إلغاء</v-btn>
          <v-btn 
            color="primary" 
            variant="flat" 
            @click="saveModel" 
            :loading="saving"
            :disabled="!valid"
            class="rounded-lg px-6 font-weight-bold"
          >
            حفظ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- حذف Modal -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card class="rounded-xl text-center pa-4">
        <v-card-text>
          <v-icon size="64" color="error" class="mb-4">ri-error-warning-line</v-icon>
          <div class="text-h6 font-weight-bold mb-2">تأكيد الحذف</div>
          <p class="text-body-1 text-grey-darken-1">هل أنت متأكد من رغبتك في حذف هذا النموذج؟ لا يمكن التراجع عن هذا الإجراء.</p>
        </v-card-text>
        <v-card-actions class="justify-center mt-2">
          <v-btn variant="text" class="rounded-lg px-4" @click="deleteDialog = false">إلغاء</v-btn>
          <v-btn color="error" variant="flat" class="rounded-lg px-6" @click="deleteItemConfirm" :loading="deleting">حذف</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top"
      timeout="3000"
      rounded="pill"
      elevation="4"
    >
      <div class="d-flex align-center">
        <v-icon start class="mr-2">{{ snackbar.color === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line' }}</v-icon>
        {{ snackbar.text }}
      </div>
      <template v-slot:actions>
        <v-btn icon="ri-close-line" variant="text" @click="snackbar.show = false"></v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { AppDataTable, AppButton } from '@/components';
import { 
  fetchAiModels, 
  fetchAiProviders, 
  createAiModel, 
  updateAiModel, 
  deleteAiModel, 
  toggleAiModelActive 
} from '@/modules/ai-platform/services/aiPlatformService';

export default {
  name: 'AiModels',
  components: {
    AppDataTable,
    AppButton
  },
  data() {
    return {
      loading: false,
      search: '',
      selectedProvider: null,
      models: [],
      providers: [],
      
      // Dialogs
      dialog: false,
      deleteDialog: false,
      valid: true,
      saving: false,
      deleting: false,
      togglingId: null,
      
      isEditing: false,
      editedItem: {
        id: null,
        label: '',
        model_id: '',
        ai_provider_id: null,
        max_context_tokens: 128000,
        input_price_per_1k: 0.0001,
        output_price_per_1k: 0.0003,
        is_active: true
      },
      defaultItem: {
        id: null,
        label: '',
        model_id: '',
        ai_provider_id: null,
        max_context_tokens: 128000,
        input_price_per_1k: 0.0001,
        output_price_per_1k: 0.0003,
        is_active: true
      },
      itemToDelete: null,
      
      // Snackbar
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      
      headers: [
        { title: 'الاسم', key: 'label', align: 'start' },
        { title: 'الكود', key: 'model_id' },
        { title: 'المزود', key: 'provider.label' },
        { title: 'الحالة', key: 'is_active' },
        { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' }
      ]
    };
  },
  
  computed: {
    totalModels() {
      return this.models.length;
    },
    activeModels() {
      return this.models.filter(m => m.is_active).length;
    },
    filteredModels() {
      if (!this.selectedProvider) return this.models;
      return this.models.filter(m => m.ai_provider_id === this.selectedProvider);
    },
    modelSuggestions() {
      const selectedProv = this.providers.find(p => p.id === this.editedItem.ai_provider_id);
      const key = selectedProv ? selectedProv.key : '';

      if (key === 'gemini') {
        return ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'];
      } else if (key === 'openai') {
        return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o1-preview', 'o3-mini'];
      } else if (key === 'anthropic') {
        return ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'];
      } else if (key === 'ollama') {
        return ['llama3', 'mistral', 'qwen2.5', 'phi3'];
      }
      return ['gemini-1.5-pro', 'gpt-4o', 'claude-3-5-sonnet'];
    }
  },
  
  mounted() {
    this.loadData();
  },
  
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const [modelsRes, providersRes] = await Promise.all([
          fetchAiModels(),
          fetchAiProviders()
        ]);
        
        this.models = modelsRes.data?.data || modelsRes.data || [];
        this.providers = providersRes.data?.data || providersRes.data || [];
      } catch (error) {
        this.showSnackbar('فشل في جلب البيانات', 'error');
        console.error('Error loading data:', error);
      } finally {
        this.loading = false;
      }
    },
    
    openAddDialog() {
      this.isEditing = false;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.dialog = true;
      if (this.$refs.form) this.$refs.form.resetValidation();
    },
    
    openEditDialog(item) {
      this.isEditing = true;
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    
    closeDialog() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.isEditing = false;
        if (this.$refs.form) this.$refs.form.resetValidation();
      });
    },
    
    async saveModel() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;
      
      this.saving = true;
      try {
        if (this.isEditing) {
          await updateAiModel(this.editedItem.id, this.editedItem);
          this.showSnackbar('تم تحديث النموذج بنجاح', 'success');
        } else {
          await createAiModel(this.editedItem);
          this.showSnackbar('تمت إضافة النموذج بنجاح', 'success');
        }
        this.closeDialog();
        this.loadData();
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || 'حدث خطأ أثناء الحفظ', 'error');
      } finally {
        this.saving = false;
      }
    },
    
    async toggleModelActive(item) {
      this.togglingId = item.id;
      try {
        await toggleAiModelActive(item.id);
        item.is_active = !item.is_active;
        this.showSnackbar(`تم ${item.is_active ? 'تفعيل' : 'تعطيل'} النموذج بنجاح`, 'success');
      } catch (error) {
        this.showSnackbar('حدث خطأ أثناء تغيير حالة النموذج', 'error');
      } finally {
        this.togglingId = null;
      }
    },
    
    confirmDelete(item) {
      this.itemToDelete = item;
      this.deleteDialog = true;
    },
    
    async deleteItemConfirm() {
      if (!this.itemToDelete) return;
      
      this.deleting = true;
      try {
        await deleteAiModel(this.itemToDelete.id);
        this.showSnackbar('تم حذف النموذج بنجاح', 'success');
        this.deleteDialog = false;
        this.loadData();
      } catch (error) {
        this.showSnackbar('حدث خطأ أثناء الحذف', 'error');
      } finally {
        this.deleting = false;
        this.itemToDelete = null;
      }
    },
    
    showSnackbar(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    }
  }
};
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
