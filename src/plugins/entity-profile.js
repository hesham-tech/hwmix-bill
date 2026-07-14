// بلجن الواجهة الأمامية المسؤول عن تهيئة سجل الـ Widgets ومسح المكونات ديناميكياً عند بدء إقلاع النظام
import registry from '@core/entity-profile/registry';

export default function (app) {
  registry.discoverWidgets();
}
