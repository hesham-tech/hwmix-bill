<template>
  <div class="ai-prompts-page pa-4">
    <!-- إحصائيات علوية -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-card class="bg-white elevation-1 rounded-xl border pa-4">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-subtitle-1 text-grey-darken-1 mb-1">إجمالي قوالب الـ Prompts</div>
              <div class="text-h4 font-weight-bold text-primary">{{ totalPrompts }}</div>
            </div>
            <v-avatar color="primary-lighten-4" size="56" rounded="lg">
              <v-icon color="primary" size="32">ri-terminal-box-line</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="bg-white elevation-1 rounded-xl border pa-4">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-subtitle-1 text-grey-darken-1 mb-1">القوالب النشطة</div>
              <div class="text-h4 font-weight-bold text-success">{{ activePrompts }}</div>
            </div>
            <v-avatar color="success-lighten-4" size="56" rounded="lg">
              <v-icon color="success" size="32">ri-check-line</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- AppDataTable المكون المشترك المعتمد بالنظام -->
    <AppDataTable
      table-key="ai_prompts.index"
      v-model:search="search"
      :headers="headers"
      :items="prompts"
      :loading="loading"
      title="إدارة قوالب الـ Prompts (Zero Hardcoded Prompts)"
      subtitle="سجل وقوالب النصوص والمطالبات المدارة من قاعدة البيانات لدعم الإدراج المتغير الديناميكي"
      icon="ri-terminal-window-fill"
      searchable
    >
      <!-- زر إضافة قالب جديد -->
      <template #actions>
        <AppButton
          color="primary"
          prepend-icon="ri-add-line"
          class="rounded-lg font-weight-bold"
          @click="openAddDialog"
        >
          إضافة قالب Prompt جديد
        </AppButton>
      </template>

      <!-- Custom Column Slots -->
      <template #item.title="{ item }">
        <div>
          <div class="font-weight-bold text-high-emphasis">{{ item.title }}</div>
          <div class="text-caption text-grey-darken-1">{{ item.description }}</div>
        </div>
      </template>

      <template #item.key="{ item }">
        <code class="text-caption text-primary bg-grey-lighten-4 px-2 py-1 rounded border">{{ item.key }}</code>
      </template>

      <template #item.capability_key="{ item }">
        <v-chip size="small" color="info" variant="flat">
          {{ item.capability_key || 'text.generate' }}
        </v-chip>
      </template>

      <template #item.version="{ item }">
        <v-chip size="small" color="primary" variant="tonal">v1</v-chip>
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
            @click="togglePromptActive(item)"
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
    <v-dialog v-model="dialog" max-width="650px" persistent>
      <v-card class="rounded-xl border">
        <v-card-title class="pa-4 border-b bg-primary text-white">
          <span class="text-h6 font-weight-bold text-white">{{ isEditing ? 'تعديل قالب Prompt' : 'إضافة قالب Prompt جديد' }}</span>
          <v-btn icon="ri-close-line" variant="text" size="small" class="float-left text-white" @click="closeDialog"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4 pt-6">
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.title"
                  label="عنوان القالب (Title)"
                  placeholder="مثال: قالب توليد وصف المنتجات التسويقي"
                  variant="outlined"
                  :rules="[v => !!v || 'العنوان مطلوب']"
                  rounded="lg"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.key"
                  label="مفتاح الـ Prompt البرمجي (Key)"
                  placeholder="مثال: product.description.generate"
                  variant="outlined"
                  :rules="[v => !!v || 'المفتاح مطلوب']"
                  rounded="lg"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.description"
                  label="الوصف والهدف من القالب"
                  variant="outlined"
                  rounded="lg"
                  rows="2"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.template"
                  label="محتوى الـ Template (يدعم المتغيرات مثل {{ product_name }})"
                  placeholder="أنت خبير تسويق محترف. اكتب وصف للمنتج: {{ product_name }}"
                  variant="outlined"
                  :rules="[v => !!v || 'محتوى القالب مطلوب']"
                  rounded="lg"
                  rows="5"
                ></v-textarea>
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
            @click="savePrompt" 
            :loading="saving"
            :disabled="!valid"
            class="rounded-lg px-6 font-weight-bold"
          >
            حفظ القالب
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
          <p class="text-body-1 text-grey-darken-1">هل أنت متأكد من رغبتك في حذف هذا القالب؟ لا يمكن التراجع عن هذا الإجراء.</p>
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
  fetchAiPrompts, 
  createAiPrompt, 
  updateAiPrompt, 
  deleteAiPrompt, 
  toggleAiPromptActive 
} from '@/modules/ai-platform/services/aiPlatformService';

export default {
  name: 'AiPrompts',
  components: {
    AppDataTable,
    AppButton
  },
  data() {
    return {
      loading: false,
      search: '',
      prompts: [],
      
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
        key: '',
        title: '',
        description: '',
        capability_key: 'text.generate',
        template: '',
        is_active: true
      },
      defaultItem: {
        id: null,
        key: '',
        title: '',
        description: '',
        capability_key: 'text.generate',
        template: '',
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
        { title: 'الاسم والوصف', key: 'title', align: 'start' },
        { title: 'مفتاح الـ PROMPT', key: 'key' },
        { title: 'القدرة التابعة', key: 'capability_key' },
        { title: 'الإصدار الحالي', key: 'version' },
        { title: 'الحالة', key: 'is_active' },
        { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' }
      ]
    };
  },
  
  computed: {
    totalPrompts() {
      return this.prompts.length;
    },
    activePrompts() {
      return this.prompts.filter(p => p.is_active).length;
    }
  },
  
  mounted() {
    this.loadData();
  },
  
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const res = await fetchAiPrompts();
        this.prompts = res.data?.data || res.data || [];
      } catch (error) {
        this.showSnackbar('فشل في جلب قوالب الـ Prompts', 'error');
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
    
    async savePrompt() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;
      
      this.saving = true;
      try {
        if (this.isEditing) {
          await updateAiPrompt(this.editedItem.id, this.editedItem);
          this.showSnackbar('تم تحديث قالب الـ Prompt بنجاح', 'success');
        } else {
          await createAiPrompt(this.editedItem);
          this.showSnackbar('تم إضافة قالب الـ Prompt بنجاح', 'success');
        }
        this.closeDialog();
        this.loadData();
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || 'حدث خطأ أثناء الحفظ', 'error');
      } finally {
        this.saving = false;
      }
    },
    
    async togglePromptActive(item) {
      this.togglingId = item.id;
      try {
        await toggleAiPromptActive(item.id);
        item.is_active = !item.is_active;
        this.showSnackbar(`تم ${item.is_active ? 'تفعيل' : 'تعطيل'} القالب بنجاح`, 'success');
      } catch (error) {
        this.showSnackbar('حدث خطأ أثناء تغيير حالة القالب', 'error');
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
        await deleteAiPrompt(this.itemToDelete.id);
        this.showSnackbar('تم حذف القالب بنجاح', 'success');
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
