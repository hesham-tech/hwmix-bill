// util لفصل منطق ترجمة أخطاء الباكند من لارافيل إلى العربية لعرضها في toastify
// usage: import translateErrors from '@/utils/translateErrors';
// ثم: const msg = translateErrors(errors)

const fieldMap = {
  phone: 'رقم الهاتف',
  password: 'كلمة المرور',
  email: 'البريد الإلكتروني',
  full_name: 'الاسم بالكامل',
  nickname: 'اسم الشهرة',
  username: 'اسم المستخدم',
  position: 'الوظيفة',
  settings: 'الإعدادات',
  last_login_at: 'آخر تسجيل دخول',
  email_verified_at: 'تأكيد البريد',
  type: 'النوع',
  balance: 'الرصيد',
  status: 'الحالة',
  company_id: 'الشركة',
  company_ids: 'الشركات',
  'company_ids.*': 'الشركات',
  created_by: 'أنشئ بواسطة',
  customer_type: 'نوع العميل',
  // حقول الفواتير
  invoice_type_id: 'نوع الفاتورة',
  invoice_type_code: 'كود نوع الفاتورة',
  user_id: 'العميل',
  items: 'المنتجات',
  itemsError: 'خطأ في المنتجات',
  // حقول المنتجات
  name: 'اسم المنتج',
  description: 'الوصف',
  description_long: 'الوصف المفصل',
  price: 'السعر',
  cost: 'التكلفة',
  sku: 'كود المنتج',
  barcode: 'الباركود',
  category_id: 'القسم',
  brand_id: 'الماركة',
  image_url: 'رابط الصورة',
  // حقول الخصائص
  attribute_id: 'الخاصية',
  attribute_value_id: 'قيمة الخاصية',
  // حقول المخازن
  warehouse_id: 'المخزن',
  from_warehouse_id: 'من المخزن',
  to_warehouse_id: 'إلى المخزن',
  // حقول العمليات المالية
  party_id: 'الطرف',
  method: 'طريقة الدفع',
  amount: 'المبلغ',
  note: 'ملاحظات',
  date: 'التاريخ',
  // حقول الإشعارات
  type: 'نوع الإشعار',
  description: 'الوصف',
  // حقول التسويات
  adjustment_type: 'نوع التسوية',
  reason: 'السبب',
  // أي حقول أخرى...
};

function translateMsg(msg) {
  return msg
    .replace('The email field must be a valid email address.', 'البريد الإلكتروني يجب أن يكون بريدًا إلكترونيًا صحيحًا.')
    .replace('The phone field is required.', 'رقم الهاتف مطلوب.')
    .replace('The phone has already been taken.', 'رقم الهاتف مستخدم من قبل.')
    .replace('The password field is required.', 'كلمة المرور مطلوبة.')
    .replace('The password must be at least 8 characters.', 'كلمة المرور يجب ألا تقل عن 8 أحرف.')
    .replace('The email has already been taken.', 'البريد الإلكتروني مستخدم من قبل.')
    .replace('The username has already been taken.', 'اسم المستخدم مستخدم من قبل.')
    .replace('The username field is required.', 'اسم المستخدم مطلوب.')
    .replace('The nickname field is required.', 'اسم الشهرة مطلوب.')
    .replace('The nickname may not be greater than 255 characters.', 'اسم الشهرة يجب ألا يزيد عن 255 حرفًا.')
    .replace('The full name may not be greater than 255 characters.', 'الاسم بالكامل يجب ألا يزيد عن 255 حرفًا.')
    .replace('The full name field is required.', 'الاسم بالكامل مطلوب.')
    .replace('The company id field is required.', 'يجب اختيار الشركة.')
    .replace('The company id must be an integer.', 'الشركة غير صحيحة.')
    .replace('The company id does not exist.', 'الشركة المختارة غير موجودة.')
    .replace('The customer type field is required.', 'نوع العميل مطلوب.')
    .replace('The customer type is invalid.', 'نوع العميل غير صحيح.')
    .replace('The password confirmation does not match.', 'تأكيد كلمة المرور غير متطابق.')
    .replace('The email field is required.', 'البريد الإلكتروني مطلوب.')
    .replace('The email must be a valid email address.', 'البريد الإلكتروني غير صحيح.')
    .replace('The phone may not be greater than 15 characters.', 'رقم الهاتف يجب ألا يزيد عن 15 رقمًا.')
    .replace('The phone must be at least 10 characters.', 'رقم الهاتف يجب ألا يقل عن 10 أرقام.')
    .replace('The phone must be a string.', 'رقم الهاتف غير صحيح.')
    .replace('The password must be a string.', 'كلمة المرور غير صحيحة.')
    .replace('The email must be a string.', 'البريد الإلكتروني غير صحيح.')
    .replace('The username must be a string.', 'اسم المستخدم غير صحيح.')
    .replace('The nickname must be a string.', 'اسم الشهرة غير صحيحة.')
    .replace('The full name must be a string.', 'الاسم بالكامل غير صحيح.')
    .replace('The company id must be a string.', 'الشركة غير صحيحة.')
    .replace('The company id must be exists.', 'الشركة المختارة غير موجودة.')
    .replace('The company ids must be an array.', 'الشركات المختارة غير صحيحة.')
    .replace('The company ids.* must be exists.', 'بعض الشركات المختارة غير موجودة.')
    .replace('The company ids.* must be an integer.', 'بعض الشركات المختارة غير صحيحة.')
    .replace('The company ids.* must be a string.', 'بعض الشركات المختارة غير صحيحة.')
    .replace('The company ids.* does not exist.', 'بعض الشركات المختارة غير موجودة.')
    .replace('The company ids must be an array.', 'الشركات المختارة غير صحيحة.')
    .replace('The company ids field is required.', 'الشركات مطلوبة.')
    .replace('The customer type must be one of the following', 'نوع العميل غير صحيح.')
    .replace('The name field is required.', 'اسم المنتج مطلوب.')
    .replace('The name may not be greater than 255 characters.', 'اسم المنتج يجب ألا يزيد عن 255 حرفًا.')
    .replace('The description field is required.', 'الوصف مطلوب.')
    .replace('The description may not be greater than 255 characters.', 'الوصف يجب ألا يزيد عن 255 حرفًا.')
    .replace('The description_long field is required.', 'الوصف المفصل مطلوب.')
    .replace('The price field is required.', 'السعر مطلوب.')
    .replace('The price must be a number.', 'السعر يجب أن يكون رقمًا.')
    .replace('The cost field is required.', 'التكلفة مطلوبة.')
    .replace('The cost must be a number.', 'التكلفة يجب أن تكون رقمًا.')
    .replace('The sku field is required.', 'كود المنتج مطلوب.')
    .replace('The sku may not be greater than 255 characters.', 'كود المنتج يجب ألا يزيد عن 255 حرفًا.')
    .replace('The barcode field is required.', 'الباركود مطلوب.')
    .replace('The barcode may not be greater than 255 characters.', 'الباركود يجب ألا يزيد عن 255 حرفًا.')
    .replace('The category id field is required.', 'القسم مطلوب.')
    .replace('The brand id field is required.', 'الماركة مطلوبة.')
    .replace('The image url field is required.', 'رابط الصورة مطلوب.')
    .replace('The attribute id field is required.', 'الخاصية مطلوبة.')
    .replace('The attribute value id field is required.', 'قيمة الخاصية مطلوبة.')
    .replace('The warehouse id field is required.', 'المخزن مطلوب.')
    .replace('The from warehouse id field is required.', 'من المخزن مطلوب.')
    .replace('The to warehouse id field is required.', 'إلى المخزن مطلوب.')
    .replace('The party id field is required.', 'الطرف مطلوب.')
    .replace('The method field is required.', 'طريقة الدفع مطلوبة.')
    .replace('The amount field is required.', 'المبلغ مطلوب.')
    .replace('The note field is required.', 'الملاحظات مطلوبة.')
    .replace('The date field is required.', 'التاريخ مطلوب.')
    .replace('The type field is required.', 'نوع الإشعار مطلوب.')
    .replace('The description field is required.', 'الوصف مطلوب.')
    .replace('The adjustment type field is required.', 'نوع التسوية مطلوب.')
    .replace('The reason field is required.', 'السبب مطلوب.')
    // ...existing code...
}

export default function translateErrors(errors) {
  if (!errors) return 'حدث خطأ غير متوقع';

  let msg = '';
  if (typeof errors === 'object' && errors !== null) {
    for (const key in errors) {
      if (Object.hasOwn(errors, key) && errors[key] && errors[key][0]) {
        const field = fieldMap[key] || key;
        const translated = translateMsg(errors[key][0]);
        if (translated) {
          msg += `${field}: ${translated}\n`;
        }
      }
    }
  } else if (typeof errors === 'string') {
    msg = errors;
  }

  return msg || 'حدث خطأ غير متوقع';
}
