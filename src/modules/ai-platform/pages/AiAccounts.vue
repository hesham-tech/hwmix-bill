<template>
  <div class="ai-accounts-page pa-4">
    <!-- إحصائيات علوية -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-card class="bg-white elevation-1 rounded-xl border pa-4">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-subtitle-1 text-grey-darken-1 mb-1">إجمالي الحسابات والمفاتيح</div>
              <div class="text-h4 font-weight-bold text-primary">{{ totalAccounts }}</div>
            </div>
            <v-avatar color="primary-lighten-4" size="56" rounded="lg">
              <v-icon color="primary" size="32">ri-key-2-line</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="bg-white elevation-1 rounded-xl border pa-4">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-subtitle-1 text-grey-darken-1 mb-1">المفاتيح السليمة (Healthy)</div>
              <div class="text-h4 font-weight-bold text-success">{{ healthyAccounts }}</div>
            </div>
            <v-avatar color="success-lighten-4" size="56" rounded="lg">
              <v-icon color="success" size="32">ri-shield-check-line</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="bg-white elevation-1 rounded-xl border pa-4">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-subtitle-1 text-grey-darken-1 mb-1">الشركات المزودة</div>
              <div class="text-h4 font-weight-bold text-info">{{ providers.length }}</div>
            </div>
            <v-avatar color="info-lighten-4" size="56" rounded="lg">
              <v-icon color="info" size="32">ri-building-4-line</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- AppDataTable المكون المشترك المعتمد بالنظام -->
    <AppDataTable
      table-key="ai_accounts.index"
      v-model:search="search"
      :headers="headers"
      :items="filteredAccounts"
      :loading="loading"
      title="إدارة مفاتيح API والحسابات (Key Vault)"
      subtitle="ربط وتشفير مفاتيح الـ API للمزودين (Gemini, OpenAI, Claude, Local) وتحديد الأولوية"
      icon="ri-key-fill"
      searchable
    >
      <!-- زر إضافة مفتاح API جديد -->
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
            ربط حساب / مفتاح API جديد
          </AppButton>
        </div>
      </template>

      <!-- Custom Column Slots -->
      <template #item.label="{ item }">
        <div class="d-flex align-center gap-2">
          <span class="font-weight-bold text-high-emphasis">{{ item.label }}</span>
          <v-chip v-if="item.custom_base_url" size="x-small" color="info" variant="outlined">سيرفر خاص</v-chip>
        </div>
      </template>

      <template #item.provider.label="{ item }">
        <v-chip size="small" color="primary" variant="tonal" class="font-weight-bold">
          {{ item.provider ? item.provider.label : 'غير محدد' }}
        </v-chip>
      </template>

      <template #item.api_key_hint="{ item }">
        <code class="text-caption text-grey-darken-3 bg-grey-lighten-4 px-2 py-1 rounded border">
          <v-icon size="14" class="mr-1" color="success">ri-lock-line</v-icon> {{ item.api_key_hint || '...****' }}
        </code>
      </template>

      <template #item.priority="{ item }">
        <v-badge color="grey-lighten-2" text-color="black" :content="`أولوية: ${item.priority || 1}`" inline></v-badge>
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
            color="info"
            size="small"
            @click="openTestDialog(item)"
            title="تجربة مفتاح الـ API المباشر"
          >
            <v-icon>ri-flask-line</v-icon>
          </v-btn>
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
            @click="toggleAccountActive(item)"
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
          <span class="text-h6 font-weight-bold text-white">{{ isEditing ? 'تعديل بيانات الحساب' : 'ربط حساب / مفتاح API جديد' }}</span>
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
                  label="اسم الحساب / الوصف (Label)"
                  placeholder="مثال: حساب جميناي الرسمي للإنتاج"
                  variant="outlined"
                  :rules="[v => !!v || 'الاسم مطلوب']"
                  rounded="lg"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.api_key_encrypted"
                  :label="isEditing ? 'مفتاح الـ API (اتركه فارغاً للإبقاء على المفتاح الحالي)' : 'مفتاح الـ API Key السرّي'"
                  type="password"
                  variant="outlined"
                  prepend-inner-icon="ri-key-line"
                  :rules="isEditing ? [] : [v => !!v || 'المفتاح مطلوب']"
                  rounded="lg"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.custom_base_url"
                  label="رابط API مخصص / Base URL (اختياري لسيرفرات Ollama أو Azure)"
                  placeholder="http://localhost:11434"
                  variant="outlined"
                  rounded="lg"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editedItem.priority"
                  label="الأولوية (Priority)"
                  type="number"
                  hint="1 = أولوية قصوى"
                  persistent-hint
                  variant="outlined"
                  rounded="lg"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="editedItem.is_active"
                  label="الحساب نشط"
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
            @click="saveAccount" 
            :loading="saving"
            :disabled="!valid"
            class="rounded-lg px-6 font-weight-bold"
          >
            حفظ المفتاح
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- تجربة المفتاح Live Test Modal -->
    <v-dialog v-model="testDialog" max-width="600px">
      <v-card class="rounded-xl border">
        <v-card-title class="pa-4 border-b bg-info text-white">
          <v-icon start color="white">ri-flask-line</v-icon>
          <span class="text-h6 font-weight-bold text-white">تجربة مفتاح الـ API المباشر</span>
          <v-btn icon="ri-close-line" variant="text" size="small" class="float-left text-white" @click="testDialog = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4 pt-6">
          <div class="mb-4">
            <v-chip color="primary" class="font-weight-bold mb-2">الحساب: {{ testingAccount?.label }}</v-chip>
            <p class="text-caption text-grey-darken-1">أدخل نص تجريبي للتأكد من قدرة المفتاح والسيرفر على التوليد والرد الفوري.</p>
          </div>

          <v-textarea
            v-model="testPrompt"
            label="الطلب / السطر التجريبي (Prompt)"
            variant="outlined"
            rounded="lg"
            rows="3"
          ></v-textarea>

          <v-alert v-if="testResult" :type="testResult.success ? 'success' : 'error'" class="mt-4 rounded-lg" variant="tonal">
            <div class="font-weight-bold mb-1">{{ testResult.success ? 'تم الاتصال والتوليد بنجاح! 🚀' : 'فشل الاتصال بمزود الخدمة' }}</div>
            <div class="text-body-2">{{ testResult.message }}</div>
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-4 border-t bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" class="rounded-lg px-4" @click="testDialog = false">إغلاق</v-btn>
          <v-btn
            color="info"
            variant="flat"
            class="rounded-lg px-6 font-weight-bold"
            @click="runTestConnection"
            :loading="testing"
          >
            إرسال وتجربة الاتصال
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
          <p class="text-body-1 text-grey-darken-1">هل أنت متأكد من رغبتك في حذف هذا المفتاح؟ لا يمكن التراجع عن هذا الإجراء.</p>
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
import apiClient from '@/api/axios.config';
import { AppDataTable, AppButton } from '@/components';
import { 
  fetchAiAccounts, 
  fetchAiProviders, 
  createAiAccount, 
  updateAiAccount, 
  deleteAiAccount, 
  toggleAiAccountActive 
} from '@/modules/ai-platform/services/aiPlatformService';

export default {
  name: 'AiAccounts',
  components: {
    AppDataTable,
    AppButton
  },
  data() {
    return {
      loading: false,
      search: '',
      selectedProvider: null,
      accounts: [],
      providers: [],
      
      // Dialogs
      dialog: false,
      deleteDialog: false,
      testDialog: false,
      valid: true,
      saving: false,
      deleting: false,
      testing: false,
      togglingId: null,
      
      testingAccount: null,
      testPrompt: 'مرحباً Gemini، اكتب كلمة مرحباً لتأكيد صحة الاتصال والمفتاح.',
      testResult: null,
      
      isEditing: false,
      editedItem: {
        id: null,
        label: '',
        ai_provider_id: null,
        api_key_encrypted: '',
        custom_base_url: '',
        priority: 1,
        is_active: true
      },
      defaultItem: {
        id: null,
        label: '',
        ai_provider_id: null,
        api_key_encrypted: '',
        custom_base_url: '',
        priority: 1,
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
        { title: 'اسم الحساب / الوصف', key: 'label', align: 'start' },
        { title: 'المزود', key: 'provider.label' },
        { title: 'المفتاح التراكمي المشفر', key: 'api_key_hint' },
        { title: 'الأولوية', key: 'priority' },
        { title: 'الحالة', key: 'is_active' },
        { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' }
      ]
    };
  },
  
  computed: {
    totalAccounts() {
      return this.accounts.length;
    },
    healthyAccounts() {
      return this.accounts.filter(a => a.health_status === 'healthy' || a.is_active).length;
    },
    filteredAccounts() {
      if (!this.selectedProvider) return this.accounts;
      return this.accounts.filter(a => a.ai_provider_id === this.selectedProvider);
    }
  },
  
  mounted() {
    this.loadData();
  },
  
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const [accountsRes, providersRes] = await Promise.all([
          fetchAiAccounts(),
          fetchAiProviders()
        ]);
        
        this.accounts = accountsRes.data?.data || accountsRes.data || [];
        this.providers = providersRes.data?.data || providersRes.data || [];
      } catch (error) {
        this.showSnackbar('فشل في جلب الحسابات', 'error');
        console.error('Error loading accounts:', error);
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
      this.editedItem = Object.assign({}, item, { api_key_encrypted: '' });
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
    
    async saveAccount() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;
      
      this.saving = true;
      try {
        if (this.isEditing) {
          await updateAiAccount(this.editedItem.id, this.editedItem);
          this.showSnackbar('تم تحديث حساب المزود والمفتاح بنجاح', 'success');
        } else {
          await createAiAccount(this.editedItem);
          this.showSnackbar('تم ربط حساب الـ API بنجاح', 'success');
        }
        this.closeDialog();
        this.loadData();
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || 'حدث خطأ أثناء الحفظ', 'error');
      } finally {
        this.saving = false;
      }
    },
    
    async toggleAccountActive(item) {
      this.togglingId = item.id;
      try {
        await toggleAiAccountActive(item.id);
        item.is_active = !item.is_active;
        this.showSnackbar(`تم ${item.is_active ? 'تفعيل' : 'تعطيل'} المفتاح بنجاح`, 'success');
      } catch (error) {
        this.showSnackbar('حدث خطأ أثناء تغيير حالة المفتاح', 'error');
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
        await deleteAiAccount(this.itemToDelete.id);
        this.showSnackbar('تم حذف المفتاح بنجاح', 'success');
        this.deleteDialog = false;
        this.loadData();
      } catch (error) {
        this.showSnackbar('حدث خطأ أثناء الحذف', 'error');
      } finally {
        this.deleting = false;
        this.itemToDelete = null;
      }
    },
    
    openTestDialog(item) {
      this.testingAccount = item;
      this.testResult = null;
      this.testDialog = true;
    },
    
    async runTestConnection() {
      if (!this.testingAccount) return;
      this.testing = true;
      this.testResult = null;
      try {
        const res = await apiClient.post('/ai/capability/text.generate', {
          prompt: this.testPrompt,
          provider_account_id: this.testingAccount.id,
        });
        
        this.testResult = {
          success: true,
          message: res.data?.data?.result || res.data?.message || 'تم الرد بنجاح من الذكاء الاصطناعي!'
        };
      } catch (error) {
        this.testResult = {
          success: false,
          message: error.response?.data?.message || error.message || 'حدث خطأ أثناء الاتصال بالمزود'
        };
      } finally {
        this.testing = false;
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
