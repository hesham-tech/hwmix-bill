import { ref, computed } from 'vue';

/**
 * Form validation and submission composable
 * مساعد لإدارة النماذج والتحقق من الصحة
 */
export function useForm(initialData = {}, validationRules = {}) {
  const formData = ref({ ...initialData });
  const errors = ref({});
  const isValid = ref(false);
  const isDirty = ref(false);
  const isSubmitting = ref(false);

  /**
   * Validate a single field
   */
  const validateField = fieldName => {
    const rules = validationRules[fieldName];
    if (!rules || !Array.isArray(rules)) {
      delete errors.value[fieldName];
      return true;
    }

    for (const rule of rules) {
      const result = rule(formData.value[fieldName]);
      if (result !== true) {
        errors.value[fieldName] = result;
        return false;
      }
    }

    delete errors.value[fieldName];
    return true;
  };

  /**
   * Validate all fields
   */
  const validate = () => {
    errors.value = {};
    let valid = true;

    for (const fieldName in validationRules) {
      if (!validateField(fieldName)) {
        valid = false;
      }
    }

    isValid.value = valid;
    return valid;
  };

  /**
   * Reset form to initial data
   */
  const reset = () => {
    formData.value = { ...initialData };
    errors.value = {};
    isDirty.value = false;
    isValid.value = false;
  };

  /**
   * Set form data
   */
  const setFormData = data => {
    formData.value = { ...data };
    isDirty.value = true;
  };

  /**
   * Set field value
   */
  const setFieldValue = (fieldName, value) => {
    formData.value[fieldName] = value;
    isDirty.value = true;
    validateField(fieldName);
  };

  /**
   * Get field error
   */
  const getFieldError = fieldName => {
    return errors.value[fieldName] || null;
  };

  /**
   * Check if field has error
   */
  const hasFieldError = fieldName => {
    return !!errors.value[fieldName];
  };

  /**
   * Submit handler wrapper
   */
  const handleSubmit = async submitFn => {
    if (!validate()) {
      return false;
    }

    isSubmitting.value = true;
    try {
      await submitFn(formData.value);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      isSubmitting.value = false;
    }
  };

  /**
   * Check if form has errors
   */
  const hasErrors = computed(() => {
    return Object.keys(errors.value).length > 0;
  });

  /**
   * Get all error messages
   */
  const errorMessages = computed(() => {
    return Object.values(errors.value);
  });

  return {
    // State
    formData,
    errors,
    isValid,
    isDirty,
    isSubmitting,
    hasErrors,
    errorMessages,

    // Methods
    validate,
    validateField,
    reset,
    setFormData,
    setFieldValue,
    getFieldError,
    hasFieldError,
    handleSubmit,
  };
}
