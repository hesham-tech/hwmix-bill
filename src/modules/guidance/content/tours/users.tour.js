/**
 * جولة صفحة الموظفين (Users Tour Steps)
 */
export default {
  steps: [
    {
      target: null,
      title: 'إدارة الموظفين 🧑‍💻',
      content: 'تتيح لك هذه الشاشة إدارة حسابات فريق عملك (مدراء، بائعين، محاسبين)، وتحديد صلاحياتهم بدقة لضمان أمان النظام.',
      placement: 'bottom'
    },
    {
      target: '.tour-user-add',
      title: 'إضافة موظف جديد ➕',
      content: 'قم بإضافة موظف جديد وتحديد الفروع المسموح له بالعمل عليها، بالإضافة لربطه بالصلاحيات المناسبة لدوره.',
      placement: 'left'
    },
    {
      target: '.tour-user-table .search-input-mini',
      title: 'البحث عن موظف 🔍',
      content: 'يمكنك إيجاد أي موظف بسرعة عن طريق كتابة اسمه أو جزء من بريده الإلكتروني هنا.',
      placement: 'bottom'
    },
    {
      target: '.tour-user-table',
      title: 'قائمة فريق العمل',
      content: 'تظهر هنا قائمة بكل حسابات الموظفين. يمكنك تنشيط أو تعطيل أي حساب في أي وقت، أو تعديل صلاحياته.',
      placement: 'top'
    }
  ]
};
