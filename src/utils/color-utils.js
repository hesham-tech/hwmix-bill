// src/utils/color-utils.js

export const EXPECTED_COLOR_PROPERTIES = [
  'لون',
  'ألوان',
  'الالوان',
  'اللون',
  'الألوان',
  'لون المنتج',
  'ألوان المنتج',
  'الالوان المنتج',
  'خاصية اللون',
  'color',
  'colors',
  'the color',
  'product color',
  'product colors',
  'color property',
  'shade',
  'shades',
  'صبغة',
  'درجة لون',
  'ظلال',
  'تدرج',
  'تدرجات',
  'لون_المنتج',
  'الوان_المنتج',
  'الالوان_المنتج',
];

export const colorDatabase = [
  { name_ar: 'أحمر', name_en: 'Red', hex: '#FF0000', synonyms: ['احمر', 'أحمر', 'احمر ناري', 'أحمر ساطع', 'أحمر فاقع', 'ناري'] },
  { name_ar: 'أحمر غامق', name_en: 'Dark Red', hex: '#8B0000', synonyms: ['احمر غامق', 'نبيتي', 'نبيتي غامق', 'احمر نبيتي'] },
  { name_ar: 'أخضر', name_en: 'Green', hex: '#008000', synonyms: ['اخضر', 'أخضر', 'اخضر فاتح', 'اخضر غامق', 'زيتي'] },
  { name_ar: 'أزرق', name_en: 'Blue', hex: '#0000FF', synonyms: ['ازرق', 'أزرق', 'لبني', 'سماوي', 'تركواز'] },
  { name_ar: 'أزرق غامق', name_en: 'Dark Blue', hex: '#00008B', synonyms: ['كحلي', 'ازرق غامق', 'أزرق داكن', 'نيلي'] },
  { name_ar: 'أصفر', name_en: 'Yellow', hex: '#FFFF00', synonyms: ['اصفر', 'أصفر', 'اصفر فاقع', 'اصفر فاتح', 'ليموني'] },
  { name_ar: 'برتقالي', name_en: 'Orange', hex: '#FFA500', synonyms: ['برتقالي', 'أورانج', 'مشمي', 'اصفر محمر', 'مرجاني برتقالي'] },
  { name_ar: 'وردي', name_en: 'Pink', hex: '#FFC0CB', synonyms: ['وردي', 'بمبي', 'بينك', 'زهري', 'وردي فاتح'] },
  { name_ar: 'بنفسجي', name_en: 'Purple', hex: '#800080', synonyms: ['بنفسجي', 'موف', 'ارجواني', 'ليلكي'] },
  { name_ar: 'بني', name_en: 'Brown', hex: '#A52A2A', synonyms: ['بني', 'كاكي', 'شوكولاتة', 'موكا', 'بني غامق', 'بني فاتح', 'بني محمر'] },
  { name_ar: 'رمادي', name_en: 'Gray', hex: '#808080', synonyms: ['رمادي', 'رصاصي', 'رمادى', 'رمادي غامق', 'رمادي ثلجي', 'رمادي مزرق'] },
  { name_ar: 'أسود', name_en: 'Black', hex: '#000000', synonyms: ['اسود', 'أسود', 'فاحم', 'أسود فاحم'] },
  { name_ar: 'أبيض', name_en: 'White', hex: '#FFFFFF', synonyms: ['ابيض', 'أبيض', 'ثلجي', 'أبيض ناصع'] },
  { name_ar: 'تركواز', name_en: 'Turquoise', hex: '#40E0D0', synonyms: ['تركواز', 'تركوازي', 'اخضر مزرق'] },
  { name_ar: 'سماوي', name_en: 'Sky Blue', hex: '#87CEEB', synonyms: ['سماوي', 'ازرق فاتح', 'لبني'] },
  { name_ar: 'لافندر', name_en: 'Lavender', hex: '#E6E6FA', synonyms: ['لافندر', 'بنفسجي فاتح', 'موف فاتح', 'ليلكي فاتح'] },
  { name_ar: 'بيج', name_en: 'Beige', hex: '#F5F5DC', synonyms: ['بيج', 'عاجي', 'سمني', 'بيج فاتح'] },
  { name_ar: 'فضي', name_en: 'Silver', hex: '#C0C0C0', synonyms: ['فضي', 'فضي لامع', 'ميتالك فضي', 'رمادي فضي'] },
  { name_ar: 'ذهبي', name_en: 'Gold', hex: '#FFD700', synonyms: ['ذهبي', 'دهبي', 'ذهب', 'ذهبي لامع'] },

  // الألوان الجديدة والموسعة:
  { name_ar: 'تيفاني', name_en: 'Tiffany Blue', hex: '#0ABAB5', synonyms: ['تيفاني', 'أزرق تيفاني', 'أخضر بحري فاتح'] },
  { name_ar: 'فوشيا', name_en: 'Fuchsia', hex: '#FF00FF', synonyms: ['فوشيا', 'فوشي', 'وردي فاقع', 'ماجنتا'] },
  { name_ar: 'نود', name_en: 'Nude', hex: '#E3BC9A', synonyms: ['نود', 'بيج لحمي', 'لحمي'] },
  { name_ar: 'خوخي', name_en: 'Peach', hex: '#FFE5B4', synonyms: ['خوخي', 'خوخي فاتح', 'بشرة الخوخ'] },
  { name_ar: 'مرجاني', name_en: 'Coral', hex: '#FF7F50', synonyms: ['مرجاني', 'برتقالي وردي', 'أحمر مرجاني'] },
  { name_ar: 'باذنجاني', name_en: 'Eggplant', hex: '#580F41', synonyms: ['باذنجاني', 'بنفسجي غامق', 'بنفسجي كئيب'] },
  { name_ar: 'روز جولد', name_en: 'Rose Gold', hex: '#B76E79', synonyms: ['روز جولد', 'ذهبي وردي', 'وردي معدني', 'ذهبي محمر'] },
  { name_ar: 'نحاسي', name_en: 'Copper', hex: '#B87333', synonyms: ['نحاسي', 'نحاسي محمر', 'برونزي', 'بني نحاسي'] },
  { name_ar: 'برغندي', name_en: 'Burgundy', hex: '#800020', synonyms: ['برغندي', 'احمر داكن', 'نبيتي غامق', 'أحمر خمري'] },
  { name_ar: 'كموني', name_en: 'Mustard', hex: '#D2B48C', synonyms: ['كموني', 'بني فاتح', 'رملي', 'أصفر كموني', 'أصفر خردلي'] },
  { name_ar: 'كشمير', name_en: 'Cashmere', hex: '#D6C1B0', synonyms: ['كشمير', 'بينك ترابي', 'وردي فاتح باهت', 'بني فاتح بارد'] },
  { name_ar: 'زيتوني', name_en: 'Olive Green', hex: '#808000', synonyms: ['زيتوني', 'أخضر زيتوني', 'أخضر داكن مصفر'] },
  { name_ar: 'كريمي', name_en: 'Cream', hex: '#FFFDD0', synonyms: ['كريمي', 'أبيض مصفر', 'عاجي فاتح'] },
  { name_ar: 'أوف وايت', name_en: 'Off-White', hex: '#F5F5DC', synonyms: ['أوف وايت', 'أبيض مائل للبيج', 'أبيض دافئ'] },
  { name_ar: 'ماجيك بلاك', name_en: 'Magic Black', hex: '#1C1C1C', synonyms: ['ماجيك بلاك', 'أسود فاحم عميق', 'أسود ملكي'] },
  { name_ar: 'موكا', name_en: 'Mocha', hex: '#654321', synonyms: ['موكا', 'بني قهوة', 'بني داكن محمر'] },
  { name_ar: 'كاراميل', name_en: 'Caramel', hex: '#C67828', synonyms: ['كاراميل', 'بني فاتح ذهبي', 'عسلي'] },
  { name_ar: 'شامبين', name_en: 'Champagne', hex: '#F7E7CE', synonyms: ['شامبين', 'ذهبي فاتح', 'بيج لامع'] },
  { name_ar: 'لؤلؤي', name_en: 'Pearl', hex: '#EAE0C8', synonyms: ['لؤلؤي', 'أبيض لؤلؤي', 'رمادي فاتح لامع'] },
  { name_ar: 'كروم', name_en: 'Chrome', hex: '#A8A8A8', synonyms: ['كروم', 'فضي كروم', 'ميتالك رمادي'] },
  { name_ar: 'أزرق بترولي', name_en: 'Petrol Blue', hex: '#005F6B', synonyms: ['أزرق بترولي', 'أزرق مخضر غامق', 'تيل غامق'] },
  { name_ar: 'أخضر نعناعي', name_en: 'Mint Green', hex: '#98FB98', synonyms: ['أخضر نعناعي', 'نعناعي', 'أخضر فاتح بارد'] },
  { name_ar: 'أصفر ليموني', name_en: 'Lemon Yellow', hex: '#FFFFA0', synonyms: ['أصفر ليموني', 'ليموني', 'أصفر فوسفوري'] },
  { name_ar: 'عنابي', name_en: 'Maroon', hex: '#800000', synonyms: ['عنابي', 'أحمر عنابي', 'أحمر داكن جداً'] },
  { name_ar: 'بترولي', name_en: 'Teal', hex: '#008080', synonyms: ['بترولي', 'أزرق مخضر', 'أخضر مزرق داكن'] },
  { name_ar: 'كموني داكن', name_en: 'Ochre', hex: '#CC7722', synonyms: ['كموني داكن', 'أصفر داكن', 'بني مصفر'] },
  { name_ar: 'فستقي', name_en: 'Pistachio', hex: '#93C572', synonyms: ['فستقي', 'أخضر فاتح مصفر', 'أخضر فستقي'] },
  { name_ar: 'طوبي', name_en: 'Terracotta', hex: '#E2725B', synonyms: ['طوبي', 'أحمر طوبي', 'بني محمر ترابي'] },
  { name_ar: 'زهري فاتح', name_en: 'Light Pink', hex: '#FFB6C1', synonyms: ['زهري فاتح', 'وردي فاتح جداً'] },
  { name_ar: 'كشميري', name_en: 'Dusty Pink', hex: '#C9A0A7', synonyms: ['كشميري', 'وردي ترابي', 'وردي باهت'] },
  { name_ar: 'بنفسجي فاتح', name_en: 'Light Purple', hex: '#DDA0DD', synonyms: ['بنفسجي فاتح', 'موف باهت', 'بنفسجي ليلكي'] },
  { name_ar: 'ميتاليك', name_en: 'Metallic', hex: '#8A8A8A', synonyms: ['ميتاليك', 'رمادي معدني', 'فضي داكن'] },
  { name_ar: 'أزرق ملكي', name_en: 'Royal Blue', hex: '#4169E1', synonyms: ['أزرق ملكي', 'أزرق زاهي', 'أزرق غامق مشرق'] },
  { name_ar: 'أخضر زمردي', name_en: 'Emerald Green', hex: '#50C878', synonyms: ['أخضر زمردي', 'زمردي', 'أخضر غامق لامع'] },
  { name_ar: 'أحمر قرمزي', name_en: 'Crimson', hex: '#DC143C', synonyms: ['أحمر قرمزي', 'قرمزي', 'أحمر دموي'] },
  { name_ar: 'أزرق سماوي فاتح', name_en: 'Light Sky Blue', hex: '#87CEFA', synonyms: ['أزرق سماوي فاتح', 'سماوي فاتح'] },
  { name_ar: 'أسود مطفي', name_en: 'Matte Black', hex: '#202020', synonyms: ['أسود مطفي', 'أسود غير لامع'] },
  { name_ar: 'أبيض لؤلؤي', name_en: 'Pearl White', hex: '#F8F8F8', synonyms: ['أبيض لؤلؤي', 'لؤلؤي'] },
  { name_ar: 'ذهبي مصفر', name_en: 'Goldenrod', hex: '#DAA520', synonyms: ['ذهبي مصفر', 'أصفر ذهبي'] },
  { name_ar: 'أزرق بحري', name_en: 'Navy Blue', hex: '#000080', synonyms: ['أزرق بحري', 'كحلي داكن', 'أزرق غامق جداً'] },
  { name_ar: 'أخضر غابوي', name_en: 'Forest Green', hex: '#228B22', synonyms: ['أخضر غابوي', 'أخضر داكن عميق'] },
  { name_ar: 'بني شوكولاتة', name_en: 'Chocolate Brown', hex: '#7B3F00', synonyms: ['بني شوكولاتة', 'شوكولاتة'] },
  { name_ar: 'رمادي فحمي', name_en: 'Charcoal Gray', hex: '#36454F', synonyms: ['رمادي فحمي', 'فحمي', 'رمادي داكن جداً'] },
  { name_ar: 'بنفسجي داكن', name_en: 'Indigo', hex: '#4B0082', synonyms: ['بنفسجي داكن', 'نيلي', 'بنفسجي مزرق'] },
  { name_ar: 'أزرق ثلجي', name_en: 'Ice Blue', hex: '#ADD8E6', synonyms: ['أزرق ثلجي', 'أزرق فاتح جداً'] },
  { name_ar: 'أخضر تفاحي', name_en: 'Apple Green', hex: '#8CC040', synonyms: ['أخضر تفاحي', 'تفاحي'] },
  { name_ar: 'بيج رملي', name_en: 'Sand Beige', hex: '#C2B280', synonyms: ['بيج رملي', 'رملي'] },
  { name_ar: 'أحمر طوبي', name_en: 'Brick Red', hex: '#B22222', synonyms: ['أحمر طوبي', 'طوبي'] },
  { name_ar: 'زيتي غامق', name_en: 'Dark Olive', hex: '#556B2F', synonyms: ['زيتي غامق', 'أخضر زيتوني غامق'] },
  { name_ar: 'بنفسجي أرجواني', name_en: 'Amethyst', hex: '#9966CC', synonyms: ['بنفسجي أرجواني', 'جمشت'] },
  { name_ar: 'أزرق كوبالت', name_en: 'Cobalt Blue', hex: '#0047AB', synonyms: ['أزرق كوبالت', 'كوبالت'] },
  { name_ar: 'أخضر ليموني', name_en: 'Chartreuse', hex: '#7FFF00', synonyms: ['أخضر ليموني', 'شارتريوز'] },
  { name_ar: 'فضي معدني', name_en: 'Metallic Silver', hex: '#A9A9A9', synonyms: ['فضي معدني', 'ميتاليك فضي'] },
  { name_ar: 'ذهبي معدني', name_en: 'Metallic Gold', hex: '#D4AF37', synonyms: ['ذهبي معدني', 'ميتاليك ذهبي'] },
  { name_ar: 'برونزي', name_en: 'Bronze', hex: '#CD7F32', synonyms: ['برونزي', 'بني برونزي'] },
  { name_ar: 'مرجاني فاتح', name_en: 'Light Coral', hex: '#F08080', synonyms: ['مرجاني فاتح', 'وردي مرجاني'] },
  { name_ar: 'أصفر باهت', name_en: 'Pastel Yellow', hex: '#FDFD96', synonyms: ['أصفر باهت', 'أصفر فاتح'] },
  { name_ar: 'أخضر فاتح', name_en: 'Light Green', hex: '#90EE90', synonyms: ['أخضر فاتح'] },
  { name_ar: 'بني محمر', name_en: 'Rust', hex: '#B7410E', synonyms: ['بني محمر', 'صدأ'] },
  { name_ar: 'رمادي فحم', name_en: 'Dark Charcoal', hex: '#343434', synonyms: ['رمادي فحم', 'فحمي غامق'] },
  { name_ar: 'كحلي فاتح', name_en: 'Light Navy', hex: '#1C395B', synonyms: ['كحلي فاتح'] },
  { name_ar: 'أزرق فلبيني', name_en: 'Philippine Blue', hex: '#0000A8', synonyms: ['أزرق فلبيني'] },
  { name_ar: 'أخضر زبرجدي', name_en: 'Jade', hex: '#00A86B', synonyms: ['أخضر زبرجدي', 'زبرجدي'] },
  { name_ar: 'رمادي حجري', name_en: 'Stone Gray', hex: '#8F979A', synonyms: ['رمادي حجري', 'حجري'] },
  { name_ar: 'أزرق كهربائي', name_en: 'Electric Blue', hex: '#7DF9FF', synonyms: ['أزرق كهربائي'] },
  { name_ar: 'أخضر فاتح نيون', name_en: 'Neon Green', hex: '#39FF14', synonyms: ['أخضر نيون', 'نيون أخضر'] },
  { name_ar: 'أصفر نيون', name_en: 'Neon Yellow', hex: '#CCFF00', synonyms: ['أصفر نيون', 'نيون أصفر'] },
  { name_ar: 'وردي نيون', name_en: 'Neon Pink', hex: '#FF6EC7', synonyms: ['وردي نيون', 'نيون وردي'] },
  { name_ar: 'برتقالي نيون', name_en: 'Neon Orange', hex: '#FF5F00', synonyms: ['برتقالي نيون', 'نيون برتقالي'] },
  { name_ar: 'أرجواني نيون', name_en: 'Neon Purple', hex: '#BC13FE', synonyms: ['أرجواني نيون', 'نيون بنفسجي'] },
  { name_ar: 'أزرق نيون', name_en: 'Neon Blue', hex: '#00FFFF', synonyms: ['أزرق نيون', 'نيون أزرق', 'سيان نيون'] },
  { name_ar: 'أخضر زجاجي', name_en: 'Bottle Green', hex: '#006A4E', synonyms: ['أخضر زجاجي', 'أخضر داكن عميق'] },
  { name_ar: 'بنفسجي ملكي', name_en: 'Royal Purple', hex: '#7851A9', synonyms: ['بنفسجي ملكي'] },
  { name_ar: 'أحمر دم الغزال', name_en: 'Ruby Red', hex: '#E0115F', synonyms: ['أحمر دم الغزال', 'روبي'] },
  { name_ar: 'فضي لامع', name_en: 'Glossy Silver', hex: '#BFBFBF', synonyms: ['فضي لامع'] },
  { name_ar: 'ذهبي لامع', name_en: 'Glossy Gold', hex: '#FFD700', synonyms: ['ذهبي لامع'] },
  { name_ar: 'أسود لامع', name_en: 'Glossy Black', hex: '#0A0A0A', synonyms: ['أسود لامع'] },
  { name_ar: 'أبيض لامع', name_en: 'Glossy White', hex: '#FEFEFE', synonyms: ['أبيض لامع'] },
  { name_ar: 'بنفسجي غامق جداً', name_en: 'Plum', hex: '#8E4585', synonyms: ['بنفسجي غامق جداً', 'برقوقي'] },
  { name_ar: 'أزرق رمادي', name_en: 'Slate Blue', hex: '#6A5ACD', synonyms: ['أزرق رمادي'] },
  { name_ar: 'أخضر مزرق', name_en: 'Celadon', hex: '#ACE1AF', synonyms: ['أخضر مزرق'] },
  { name_ar: 'وردي فاتح جداً', name_en: 'Baby Pink', hex: '#F4C2C2', synonyms: ['وردي فاتح جداً', 'وردي أطفال'] },
  { name_ar: 'بيج فاتح جداً', name_en: 'Creamy Beige', hex: '#F5F5DC', synonyms: ['بيج فاتح جداً', 'بيج كريمي'] },
  { name_ar: 'رمادي مزرق فاتح', name_en: 'Light Slate Gray', hex: '#778899', synonyms: ['رمادي مزرق فاتح'] },
  { name_ar: 'أصفر برتقالي', name_en: 'Amber', hex: '#FFBF00', synonyms: ['أصفر برتقالي', 'كهرماني'] },
  { name_ar: 'أزرق مائي', name_en: 'Aqua Marine', hex: '#7FFFD4', synonyms: ['أزرق مائي', 'أكوا مارين'] },
  { name_ar: 'أخضر بحري', name_en: 'Sea Green', hex: '#2E8B57', synonyms: ['أخضر بحري'] },
  { name_ar: 'برتقالي محروق', name_en: 'Burnt Orange', hex: '#CC5500', synonyms: ['برتقالي محروق'] },
  { name_ar: 'بنفسجي أوركيد', name_en: 'Orchid', hex: '#DA70D6', synonyms: ['بنفسجي أوركيد', 'أوركيد'] },
  { name_ar: 'بني صدأ', name_en: 'Russet', hex: '#80461B', synonyms: ['بني صدأ'] },
  { name_ar: 'أحمر دم الغراب', name_en: 'Sangria', hex: '#92000A', synonyms: ['أحمر دم الغراب', 'سانجريا'] },
  { name_ar: 'ذهبي فاتح', name_en: 'Light Gold', hex: '#E6BE8A', synonyms: ['ذهبي فاتح'] },
  { name_ar: 'فضي داكن', name_en: 'Dark Silver', hex: '#708090', synonyms: ['فضي داكن'] },
  { name_ar: 'أسود فحم', name_en: 'Ebony', hex: '#555D50', synonyms: ['أسود فحم'] },
  { name_ar: 'أبيض عاجي', name_en: 'Ivory', hex: '#FFFFF0', synonyms: ['أبيض عاجي'] },
  { name_ar: 'أزرق صخري', name_en: 'Denim Blue', hex: '#2243B6', synonyms: ['أزرق صخري', 'دنيم أزرق'] },
  { name_ar: 'أخضر عشبي', name_en: 'Grass Green', hex: '#7CFC00', synonyms: ['أخضر عشبي'] },
  { name_ar: 'بني رملي', name_en: 'Sandy Brown', hex: '#F4A460', synonyms: ['بني رملي'] },
  { name_ar: 'رمادي غامق جداً', name_en: "Davy's Gray", hex: '#555555', synonyms: ['رمادي غامق جداً'] },
  { name_ar: 'أصفر كناري', name_en: 'Canary Yellow', hex: '#FFFF99', synonyms: ['أصفر كناري'] },
  { name_ar: 'أزرق زجاجي', name_en: 'Glass Blue', hex: '#C2DFFF', synonyms: ['أزرق زجاجي'] },
  { name_ar: 'أخضر فوسفوري', name_en: 'Lime Green', hex: '#32CD32', synonyms: ['أخضر فوسفوري'] },
  { name_ar: 'أحمر كرزي', name_en: 'Cherry Red', hex: '#DE3163', synonyms: ['أحمر كرزي'] },
  { name_ar: 'وردي فاميه', name_en: 'Mauve', hex: '#E0B0FF', synonyms: ['وردي فاميه', 'موف باهت'] },
  { name_ar: 'بني ترابي', name_en: 'Earthy Brown', hex: '#8B4513', synonyms: ['بني ترابي'] },
  { name_ar: 'رمادي معدني غامق', name_en: 'Gunmetal', hex: '#2A3439', synonyms: ['رمادي معدني غامق', 'جن ميتال'] },
  { name_ar: 'أزرق فاتح جداً', name_en: 'Powder Blue', hex: '#B0E0E6', synonyms: ['أزرق فاتح جداً', 'أزرق بودرة'] },
  { name_ar: 'أخضر فسفوري فاتح', name_en: 'Lime', hex: '#00FF00', synonyms: ['أخضر فسفوري فاتح', 'لايم'] },
  { name_ar: 'أصفر ذهبي داكن', name_en: 'Dark Goldenrod', hex: '#B8860B', synonyms: ['أصفر ذهبي داكن'] },
  { name_ar: 'بنفسجي داكن عميق', name_en: 'Deep Purple', hex: '#36013F', synonyms: ['بنفسجي داكن عميق'] },
  { name_ar: 'وردي خوخي', name_en: 'Dusty Rose', hex: '#C68E91', synonyms: ['وردي خوخي', 'وردي مغبر'] },
  { name_ar: 'أحمر قرميد', name_en: 'Tile Red', hex: '#CB3A30', synonyms: ['أحمر قرميد', 'قرميد'] },
  { name_ar: 'أزرق فولاذي', name_en: 'Steel Blue', hex: '#4682B4', synonyms: ['أزرق فولاذي'] },
  { name_ar: 'أخضر الغابة', name_en: 'Forest Green', hex: '#228B22', synonyms: ['أخضر الغابة'] },
  { name_ar: 'بني محروق', name_en: 'Burnt Umber', hex: '#8A3324', synonyms: ['بني محروق'] },
  { name_ar: 'رمادي مزرق', name_en: 'Cadet Gray', hex: '#91A3B0', synonyms: ['رمادي مزرق'] },
  { name_ar: 'أصفر كهرماني', name_en: 'Saffron', hex: '#F4C430', synonyms: ['أصفر كهرماني', 'زعفراني'] },
  { name_ar: 'أزرق نيلي', name_en: 'Midnight Blue', hex: '#191970', synonyms: ['أزرق نيلي', 'أزرق منتصف الليل'] },
  { name_ar: 'أخضر مصفر', name_en: 'Lime Green', hex: '#32CD32', synonyms: ['أخضر مصفر'] },
  { name_ar: 'وردي فاقع', name_en: 'Hot Pink', hex: '#FF69B4', synonyms: ['وردي فاقع'] },
  { name_ar: 'بني شوكولاته داكن', name_en: 'Dark Chocolate', hex: '#3B2414', synonyms: ['بني شوكولاته داكن'] },
  { name_ar: 'رمادي صخري', name_en: 'Stone', hex: '#878787', synonyms: ['رمادي صخري'] },
  { name_ar: 'أحمر دموي', name_en: 'Blood Red', hex: '#880808', synonyms: ['أحمر دموي'] },
  { name_ar: 'أزرق سماوي داكن', name_en: 'Dark Sky Blue', hex: '#458B74', synonyms: ['أزرق سماوي داكن'] },
  { name_ar: 'أخضر غامق جداً', name_en: 'Dark Green', hex: '#006400', synonyms: ['أخضر غامق جداً'] },
  { name_ar: 'بيج وردي', name_en: 'Rose Beige', hex: '#D7BCB5', synonyms: ['بيج وردي'] },
  { name_ar: 'أزرق مخضر فاتح', name_en: 'Light Teal', hex: '#82EEFD', synonyms: ['أزرق مخضر فاتح'] },
  { name_ar: 'بنفسجي زهري', name_en: 'Lavender Blush', hex: '#FFF0F5', synonyms: ['بنفسجي زهري'] },
  { name_ar: 'رمادي طباشيري', name_en: 'Chalk Gray', hex: '#EBEBEB', synonyms: ['رمادي طباشيري'] },
  { name_ar: 'أسود جت', name_en: 'Jet Black', hex: '#343434', synonyms: ['أسود جت'] },
  { name_ar: 'أبيض ثلجي', name_en: 'Snow White', hex: '#FFFAFA', synonyms: ['أبيض ثلجي'] },
  { name_ar: 'برتقالي مشرق', name_en: 'Vivid Orange', hex: '#FF7F00', synonyms: ['برتقالي مشرق'] },
  { name_ar: 'بنفسجي ملكي داكن', name_en: 'Deep Royal Purple', hex: '#4F1B77', synonyms: ['بنفسجي ملكي داكن'] },
  { name_ar: 'أحمر ماروني', name_en: 'Deep Maroon', hex: '#5E0606', synonyms: ['أحمر ماروني'] },
  { name_ar: 'ذهبي فاتح مشع', name_en: 'Radiant Gold', hex: '#FFDF00', synonyms: ['ذهبي فاتح مشع'] },
  { name_ar: 'فضي بلاتيني', name_en: 'Platinum Silver', hex: '#E5E4E2', synonyms: ['فضي بلاتيني'] },
  { name_ar: 'بني خشبي', name_en: 'Wood Brown', hex: '#8B4513', synonyms: ['بني خشبي'] },
  { name_ar: 'رمادي غامق لامع', name_en: 'Metallic Dark Gray', hex: '#5A5A5A', synonyms: ['رمادي غامق لامع'] },
  { name_ar: 'أزرق فستقي', name_en: 'Pistachio Blue', hex: '#ADD8E6', synonyms: ['أزرق فستقي'] },
  { name_ar: 'أخضر زيتوني فاتح', name_en: 'Light Olive Green', hex: '#BCE88C', synonyms: ['أخضر زيتوني فاتح'] },
  { name_ar: 'بنفسجي مغبر', name_en: 'Dusty Purple', hex: '#8274A0', synonyms: ['بنفسجي مغبر'] },
  { name_ar: 'أحمر توتي', name_en: 'Berry Red', hex: '#8D021F', synonyms: ['أحمر توتي'] },
  { name_ar: 'أزرق مخملي', name_en: 'Velvet Blue', hex: '#424B54', synonyms: ['أزرق مخملي'] },
  { name_ar: 'أخضر طحلبي', name_en: 'Moss Green', hex: '#8A9A5B', synonyms: ['أخضر طحلبي'] },
  { name_ar: 'بني ذهبي', name_en: 'Golden Brown', hex: '#996515', synonyms: ['بني ذهبي'] },
  { name_ar: 'رمادي حجر السج', name_en: 'Obsidian Gray', hex: '#293133', synonyms: ['رمادي حجر السج'] },
  { name_ar: 'أصفر ذرة', name_en: 'Corn Yellow', hex: '#FBEC5D', synonyms: ['أصفر ذرة'] },
  { name_ar: 'أزرق أتلانتي', name_en: 'Atlantic Blue', hex: '#004B8D', synonyms: ['أزرق أتلانتي'] },
  { name_ar: 'أخضر فسفوري غامق', name_en: 'Dark Lime Green', hex: '#32CD32', synonyms: ['أخضر فسفوري غامق'] },
  { name_ar: 'وردي فاتح جداً', name_en: 'Blush Pink', hex: '#FE8594', synonyms: ['وردي فاتح جداً'] },
  { name_ar: 'بني شوكولاتة فاتح', name_en: 'Light Chocolate Brown', hex: '#CD7F32', synonyms: ['بني شوكولاتة فاتح'] },
  { name_ar: 'رمادي حجري فاتح', name_en: 'Light Stone Gray', hex: '#D1D1D1', synonyms: ['رمادي حجري فاتح'] },
  { name_ar: 'أحمر فاتح', name_en: 'Light Red', hex: '#FFCCCB', synonyms: ['أحمر فاتح'] },
  { name_ar: 'أزرق فاتح جداً', name_en: 'Light Blue', hex: '#ADD8E6', synonyms: ['أزرق فاتح جداً'] },
  { name_ar: 'أخضر فاتح جداً', name_en: 'Light Green', hex: '#90EE90', synonyms: ['أخضر فاتح جداً'] },
  { name_ar: 'بيج داكن', name_en: 'Dark Beige', hex: '#A89F82', synonyms: ['بيج داكن'] },
  { name_ar: 'أرجواني غامق', name_en: 'Dark Magenta', hex: '#8B008B', synonyms: ['أرجواني غامق'] },
  { name_ar: 'رمادي متوسط', name_en: 'Medium Gray', hex: '#BEBEBE', synonyms: ['رمادي متوسط'] },
  { name_ar: 'فضي مصقول', name_en: 'Polished Silver', hex: '#C4C4C4', synonyms: ['فضي مصقول'] },
  { name_ar: 'ذهبي مصقول', name_en: 'Polished Gold', hex: '#DAA520', synonyms: ['ذهبي مصقول'] },
  { name_ar: 'أزرق سماوي داكن', name_en: 'Azure', hex: '#007FFF', synonyms: ['أزرق سماوي داكن', 'أزور'] },
  { name_ar: 'أخضر فاتح ناعم', name_en: 'Soft Green', hex: '#C1E1C1', synonyms: ['أخضر فاتح ناعم'] },
  { name_ar: 'وردي أرجواني', name_en: 'Magenta', hex: '#FF00FF', synonyms: ['وردي أرجواني', 'ماجنتا'] },
  { name_ar: 'بني فاتح ترابي', name_en: 'Light Earth Brown', hex: '#D2B48C', synonyms: ['بني فاتح ترابي'] },
  { name_ar: 'رمادي فاتح جداً', name_en: 'Light Gray', hex: '#D3D3D3', synonyms: ['رمادي فاتح جداً'] },
  { name_ar: 'أحمر كرزي داكن', name_en: 'Dark Cherry Red', hex: '#800606', synonyms: ['أحمر كرزي داكن'] },
  { name_ar: 'أزرق سماوي عميق', name_en: 'Deep Sky Blue', hex: '#00BFFF', synonyms: ['أزرق سماوي عميق'] },
  { name_ar: 'أخضر زيتي فاتح', name_en: 'Light Olive', hex: '#ADFF2F', synonyms: ['أخضر زيتي فاتح'] },
  { name_ar: 'وردي خوخي فاتح', name_en: 'Light Peach Pink', hex: '#FFDAB9', synonyms: ['وردي خوخي فاتح'] },
  { name_ar: 'بنفسجي باهت', name_en: 'Pale Violet', hex: '#DBB0F6', synonyms: ['بنفسجي باهت'] },
  { name_ar: 'بني كستنائي', name_en: 'Chestnut', hex: '#954535', synonyms: ['بني كستنائي'] },
  { name_ar: 'رمادي فحم صلب', name_en: 'Solid Charcoal', hex: '#333333', synonyms: ['رمادي فحم صلب'] },
  { name_ar: 'أزرق هادئ', name_en: 'Serene Blue', hex: '#6D9BC3', synonyms: ['أزرق هادئ'] },
  { name_ar: 'أخضر هادئ', name_en: 'Serene Green', hex: '#77DD77', synonyms: ['أخضر هادئ'] },
  { name_ar: 'أحمر هادئ', name_en: 'Serene Red', hex: '#CD5C5C', synonyms: ['أحمر هادئ'] },
  { name_ar: 'ذهبي برونزي', name_en: 'Bronze Gold', hex: '#B27218', synonyms: ['ذهبي برونزي'] },
  { name_ar: 'فضي رمادي', name_en: 'Grayish Silver', hex: '#BFC0C2', synonyms: ['فضي رمادي'] },
  { name_ar: 'أسود كربون', name_en: 'Carbon Black', hex: '#3B3B3B', synonyms: ['أسود كربون'] },
  { name_ar: 'أبيض عاجي', name_en: 'Creamy White', hex: '#FDFDD0', synonyms: ['أبيض عاجي'] },
  { name_ar: 'بنفسجي باهت جداً', name_en: 'Ultra Violet', hex: '#6B5B95', synonyms: ['بنفسجي باهت جداً'] },
  { name_ar: 'أحمر غامق جداً', name_en: 'Very Dark Red', hex: '#6A0000', synonyms: ['أحمر غامق جداً'] },
  { name_ar: 'أزرق غامق جداً', name_en: 'Very Dark Blue', hex: '#000050', synonyms: ['أزرق غامق جداً'] },
  { name_ar: 'أخضر غامق جداً', name_en: 'Very Dark Green', hex: '#003300', synonyms: ['أخضر غامق جداً'] },
  { name_ar: 'بني غامق جداً', name_en: 'Very Dark Brown', hex: '#2A0000', synonyms: ['بني غامق جداً'] },
  { name_ar: 'رمادي غامق جداً', name_en: 'Very Dark Gray', hex: '#2C2C2C', synonyms: ['رمادي غامق جداً'] },
  { name_ar: 'بنفسجي داكن محمر', name_en: 'Aubergine', hex: '#3B0000', synonyms: ['بنفسجي داكن محمر'] }, // لون دهانات وميك اب
  { name_ar: 'أحمر خدود', name_en: 'Blush', hex: '#DE5D83', synonyms: ['أحمر خدود', 'بلاش'] }, // ميك اب
  { name_ar: 'برونزي لامع', name_en: 'Shimmering Bronze', hex: '#C08033', synonyms: ['برونزي لامع'] }, // ميك اب وسيارات
  { name_ar: 'أسود ميتاليك', name_en: 'Metallic Black', hex: '#404040', synonyms: ['أسود ميتاليك', 'أسود معدني'] }, // سيارات
  { name_ar: 'فضي رصاصي', name_en: 'Gunmetal Silver', hex: '#525252', synonyms: ['فضي رصاصي'] }, // سيارات
  { name_ar: 'أحمر لامع', name_en: 'Glossy Red', hex: '#DD0000', synonyms: ['أحمر لامع'] }, // سيارات
  { name_ar: 'أزرق سماوي لامع', name_en: 'Glossy Sky Blue', hex: '#87CEEB', synonyms: ['أزرق سماوي لامع'] }, // سيارات
  { name_ar: 'أخضر زجاجي عميق', name_en: 'Deep Bottle Green', hex: '#004225', synonyms: ['أخضر زجاجي عميق'] }, // دهانات
  { name_ar: 'بيج داكن ترابي', name_en: 'Earthy Dark Beige', hex: '#A39F82', synonyms: ['بيج داكن ترابي'] }, // دهانات
  { name_ar: 'وردي أرجواني عميق', name_en: 'Deep Magenta', hex: '#8B008B', synonyms: ['وردي أرجواني عميق'] }, // ميك اب
  { name_ar: 'بني خشبي داكن', name_en: 'Dark Wood Brown', hex: '#602B00', synonyms: ['بني خشبي داكن'] }, // دهانات وأثاث
  { name_ar: 'رمادي كونكريت', name_en: 'Concrete Gray', hex: '#A9A9A9', synonyms: ['رمادي كونكريت', 'رمادي خرساني'] }, // دهانات
  { name_ar: 'فضي ماسي', name_en: 'Diamond Silver', hex: '#B9B9B9', synonyms: ['فضي ماسي'] }, // مجوهرات وسيارات
  { name_ar: 'ذهبي عتيق', name_en: 'Antique Gold', hex: '#C19A6B', synonyms: ['ذهبي عتيق'] }, // ديكور وموضة
  { name_ar: 'أزرق فلبيني داكن', name_en: 'Dark Philippine Blue', hex: '#00008B', synonyms: ['أزرق فلبيني داكن'] }, // ملابس
  { name_ar: 'أخضر فاتح نعناعي', name_en: 'Light Mint Green', hex: '#A8E4A0', synonyms: ['أخضر فاتح نعناعي'] }, // ملابس
  { name_ar: 'أصفر خردلي', name_en: 'Mustard Yellow', hex: '#FFDB58', synonyms: ['أصفر خردلي'] }, // موضة وملابس
  { name_ar: 'برتقالي صدأ', name_en: 'Rust Orange', hex: '#B7410E', synonyms: ['برتقالي صدأ'] }, // موضة وديكور
  { name_ar: 'بنفسجي باهت عميق', name_en: 'Deep Pale Purple', hex: '#A78CBE', synonyms: ['بنفسجي باهت عميق'] }, // موضة ومكياج
  { name_ar: 'بني شوكولاتة فاتح', name_en: 'Milk Chocolate', hex: '#8C4B40', synonyms: ['بني شوكولاتة فاتح'] }, // موضة ومكياج
  { name_ar: 'رمادي أزرق', name_en: 'Blue Gray', hex: '#6699CC', synonyms: ['رمادي أزرق'] }, // دهانات وملابس
  { name_ar: 'أحمر نبيذي', name_en: 'Wine Red', hex: '#722F37', synonyms: ['أحمر نبيذي', 'نبيذي'] }, // موضة ودهانات
  { name_ar: 'أزرق باهت', name_en: 'Pale Blue', hex: '#AFDFF7', synonyms: ['أزرق باهت'] }, // موضة ودهانات
  { name_ar: 'أخضر باهت', name_en: 'Pale Green', hex: '#C0DCC0', synonyms: ['أخضر باهت'] }, // موضة ودهانات
  { name_ar: 'وردي غامق جداً', name_en: 'Deep Pink', hex: '#C71585', synonyms: ['وردي غامق جداً'] }, // مكياج
  { name_ar: 'بني عسلي', name_en: 'Honey Brown', hex: '#C8A2C8', synonyms: ['بني عسلي'] }, // مكياج
  { name_ar: 'رمادي معدني خفيف', name_en: 'Light Metallic Gray', hex: '#CCCCCC', synonyms: ['رمادي معدني خفيف'] }, // سيارات
  { name_ar: 'أصفر باستيل', name_en: 'Pastel Yellow', hex: '#FAFAD2', synonyms: ['أصفر باستيل'] }, // دهانات وموضة
  { name_ar: 'أزرق كوبالت ساطع', name_en: 'Vivid Cobalt Blue', hex: '#007AA5', synonyms: ['أزرق كوبالت ساطع'] }, // دهانات
  { name_ar: 'أخضر ليموني ساطع', name_en: 'Vivid Lime Green', hex: '#9FE2BF', synonyms: ['أخضر ليموني ساطع'] }, // موضة
  { name_ar: 'وردي مرجاني مشرق', name_en: 'Bright Coral Pink', hex: '#F88379', synonyms: ['وردي مرجاني مشرق'] }, // مكياج وموضة
  { name_ar: 'بني قهوة داكن', name_en: 'Dark Coffee Brown', hex: '#4B3621', synonyms: ['بني قهوة داكن'] }, // دهانات وأثاث
  { name_ar: 'رمادي دخاني', name_en: 'Smokey Gray', hex: '#738276', synonyms: ['رمادي دخاني'] }, // دهانات وسيارات
  { name_ar: 'أسود بيانو', name_en: 'Piano Black', hex: '#1B1B1B', synonyms: ['أسود بيانو', 'أسود لامع عميق'] }, // سيارات ودهانات
  { name_ar: 'أبيض قطني', name_en: 'Cotton White', hex: '#F0F0F0', synonyms: ['أبيض قطني'] }, // ملابس ودهانات
  { name_ar: 'ذهبي أصفر', name_en: 'Yellow Gold', hex: '#FFCC00', synonyms: ['ذهبي أصفر'] }, // مجوهرات
  { name_ar: 'فضي مصقول', name_en: 'Brushed Silver', hex: '#C0C0C0', synonyms: ['فضي مصقول'] }, // ديكور وسيارات
  { name_ar: 'أزرق أوفرويلد', name_en: 'Overwhelm Blue', hex: '#212B36', synonyms: ['أزرق أوفرويلد'] }, // لون سيارات حديث
  { name_ar: 'أخضر طحلب', name_en: 'Algae Green', hex: '#54625A', synonyms: ['أخضر طحلب'] }, // دهانات
  { name_ar: 'وردي فاميه داكن', name_en: 'Dark Mauve', hex: '#5F006D', synonyms: ['وردي فاميه داكن'] }, // مكياج
  { name_ar: 'بني تيراكوتا', name_en: 'Terra Cotta Brown', hex: '#CB6D51', synonyms: ['بني تيراكوتا'] }, // دهانات
  { name_ar: 'رمادي صلب', name_en: 'Solid Gray', hex: '#777777', synonyms: ['رمادي صلب'] }, // دهانات
  { name_ar: 'أزرق ملكي داكن', name_en: 'Dark Royal Blue', hex: '#000080', synonyms: ['أزرق ملكي داكن'] }, // ملابس
  { name_ar: 'أخضر جيشي', name_en: 'Army Green', hex: '#4B5320', synonyms: ['أخضر جيشي'] }, // ملابس
  { name_ar: 'أصفر ليموني نيون', name_en: 'Neon Lemon Yellow', hex: '#C0FF00', synonyms: ['أصفر ليموني نيون'] }, // موضة
  { name_ar: 'أحمر كريزي', name_en: 'Crazy Red', hex: '#FF2400', synonyms: ['أحمر كريزي'] }, // موضة
  { name_ar: 'فضي مطفي', name_en: 'Matte Silver', hex: '#A9A9A9', synonyms: ['فضي مطفي'] }, // سيارات
  { name_ar: 'ذهبي مطفي', name_en: 'Matte Gold', hex: '#D4AF37', synonyms: ['ذهبي مطفي'] }, // سيارات
  { name_ar: 'برونزي مطفي', name_en: 'Matte Bronze', hex: '#CD7F32', synonyms: ['برونزي مطفي'] }, // سيارات
  { name_ar: 'بنفسجي داكن جداً', name_en: 'Deep Plum', hex: '#4F004F', synonyms: ['بنفسجي داكن جداً'] }, // موضة ومكياج
  { name_ar: 'أحمر صارخ', name_en: 'Fiery Red', hex: '#E62020', synonyms: ['أحمر صارخ'] }, // موضة
  { name_ar: 'أزرق هادئ عميق', name_en: 'Deep Serene Blue', hex: '#4A6491', synonyms: ['أزرق هادئ عميق'] }, // دهانات
  { name_ar: 'أخضر هادئ عميق', name_en: 'Deep Serene Green', hex: '#4F8D50', synonyms: ['أخضر هادئ عميق'] }, // دهانات
  { name_ar: 'بني شوكولاتة حليب', name_en: 'Milk Chocolate Brown', hex: '#7F4600', synonyms: ['بني شوكولاتة حليب'] }, // مكياج
  { name_ar: 'رمادي أسمنتي', name_en: 'Cement Gray', hex: '#8C92AC', synonyms: ['رمادي أسمنتي'] }, // دهانات
  { name_ar: 'أزرق ليلي', name_en: 'Night Blue', hex: '#2C3E50', synonyms: ['أزرق ليلي'] }, // موضة
  { name_ar: 'أخضر عشبي فاتح', name_en: 'Light Grass Green', hex: '#9EDF74', synonyms: ['أخضر عشبي فاتح'] }, // دهانات
  { name_ar: 'وردي فوشيا فاتح', name_en: 'Light Fuchsia Pink', hex: '#FF99FF', synonyms: ['وردي فوشيا فاتح'] }, // موضة ومكياج
  { name_ar: 'بني محروق فاتح', name_en: 'Light Burnt Umber', hex: '#A0522D', synonyms: ['بني محروق فاتح'] }, // دهانات
  { name_ar: 'رمادي صلب داكن', name_en: 'Dark Solid Gray', hex: '#555555', synonyms: ['رمادي صلب داكن'] }, // سيارات ودهانات
  { name_ar: 'أحمر توتي داكن', name_en: 'Dark Berry Red', hex: '#660000', synonyms: ['أحمر توتي داكن'] }, // موضة
  { name_ar: 'أزرق سماوي صافي', name_en: 'Clear Sky Blue', hex: '#B2FFFF', synonyms: ['أزرق سماوي صافي'] }, // دهانات
  { name_ar: 'أخضر زمردي فاتح', name_en: 'Light Emerald Green', hex: '#80E080', synonyms: ['أخضر زمردي فاتح'] }, // موضة
  { name_ar: 'وردي أرجواني فاتح', name_en: 'Light Magenta', hex: '#FFB3FF', synonyms: ['وردي أرجواني فاتح'] }, // موضة ومكياج
  { name_ar: 'بني كستنائي داكن', name_en: 'Dark Chestnut', hex: '#602B2B', synonyms: ['بني كستنائي داكن'] }, // أثاث ودهانات
  { name_ar: 'رمادي فحمي فاتح', name_en: 'Light Charcoal Gray', hex: '#808080', synonyms: ['رمادي فحمي فاتح'] }, // سيارات
  { name_ar: 'أزرق ملكي فاتح', name_en: 'Light Royal Blue', hex: '#6C8CD5', synonyms: ['أزرق ملكي فاتح'] }, // ملابس
  { name_ar: 'أخضر عشبي ساطع', name_en: 'Bright Grass Green', hex: '#7FFF00', synonyms: ['أخضر عشبي ساطع'] }, // دهانات
  { name_ar: 'بنفسجي أوركيد فاتح', name_en: 'Light Orchid', hex: '#E6A8D7', synonyms: ['بنفسجي أوركيد فاتح'] }, // مكياج وموضة
  { name_ar: 'أحمر قرمزي فاتح', name_en: 'Light Crimson', hex: '#F08080', synonyms: ['أحمر قرمزي فاتح'] }, // موضة
  { name_ar: 'ذهبي شامبين', name_en: 'Champagne Gold', hex: '#F0E68C', synonyms: ['ذهبي شامبين'] }, // ديكور
  { name_ar: 'فضي ألومنيوم', name_en: 'Aluminum Silver', hex: '#C0C0C0', synonyms: ['فضي ألومنيوم'] }, // سيارات
  { name_ar: 'بني عاجي', name_en: 'Taupe', hex: '#483C32', synonyms: ['بني عاجي', 'توب'] }, // دهانات
  { name_ar: 'أزرق كوبالت فاتح', name_en: 'Light Cobalt Blue', hex: '#4285F4', synonyms: ['أزرق كوبالت فاتح'] }, // دهانات
  { name_ar: 'أخضر نيون فاتح', name_en: 'Light Neon Green', hex: '#7CFC00', synonyms: ['أخضر نيون فاتح'] }, // موضة
  { name_ar: 'وردي فاتح ناعم', name_en: 'Soft Light Pink', hex: '#FADADD', synonyms: ['وردي فاتح ناعم'] }, // مكياج
  { name_ar: 'بني بني محايد', name_en: 'Neutral Brown', hex: '#8B6B58', synonyms: ['بني بني محايد'] }, // دهانات
  { name_ar: 'رمادي صلب خفيف', name_en: 'Light Solid Gray', hex: '#C0C0C0', synonyms: ['رمادي صلب خفيف'] }, // دهانات
  { name_ar: 'أزرق بحري فاتح', name_en: 'Light Navy Blue', hex: '#31536F', synonyms: ['أزرق بحري فاتح'] }, // ملابس
  { name_ar: 'أخضر ليموني غامق', name_en: 'Dark Lime', hex: '#8BC34A', synonyms: ['أخضر ليموني غامق'] }, // دهانات
  { name_ar: 'بنفسجي لؤلؤي', name_en: 'Pearl Purple', hex: '#B2A0BF', synonyms: ['بنفسجي لؤلؤي'] }, // مكياج
  { name_ar: 'أحمر قرمزي ناري', name_en: 'Fiery Crimson', hex: '#CC0000', synonyms: ['أحمر قرمزي ناري'] }, // موضة
  { name_ar: 'ذهبي أصفر لامع', name_en: 'Glossy Yellow Gold', hex: '#FFD700', synonyms: ['ذهبي أصفر لامع'] }, // مجوهرات
  { name_ar: 'فضي ألماسي لامع', name_en: 'Glossy Diamond Silver', hex: '#E0E0E0', synonyms: ['فضي ألماسي لامع'] }, // مجوهرات
];

export function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stringSimilarityScore(str1, str2) {
  if (!str1 || !str2) return 0;
  str1 = normalizeText(str1);
  str2 = normalizeText(str2);
  if (str1 === str2) return 1;

  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  let commonWords = 0;

  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2 || (word1.length > 2 && word2.includes(word1)) || (word2.length > 2 && word1.includes(word2))) {
        commonWords++;
        break;
      }
    }
  }

  return (commonWords / words1.length + commonWords / words2.length) / 2 || 0;
}

export function suggestClosestColors(input, limit = 5, minSimilarityThreshold = 0.35) {
  const normalizedInput = normalizeText(input);
  if (!normalizedInput) return [];

  const scoredColors = colorDatabase.map(color => {
    const allNames = [color.name_ar, color.name_en, ...(color.synonyms || [])];
    const normalizedNames = allNames.map(name => normalizeText(name));

    let maxScore = 0;
    for (const name of normalizedNames) {
      maxScore = Math.max(maxScore, stringSimilarityScore(normalizedInput, name));

      if (name.includes(normalizedInput) && normalizedInput.length > 1) {
        maxScore = Math.max(maxScore, 0.8 + (normalizedInput.length / name.length) * 0.2);
      }
    }

    return { ...color, score: maxScore };
  });

  return scoredColors
    .filter(c => c.score >= minSimilarityThreshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getExactColorHexCode(colorName) {
  const normalizedInput = normalizeText(colorName);
  if (!normalizedInput) return null;

  for (const color of colorDatabase) {
    const allNames = [color.name_ar, color.name_en, ...(color.synonyms || [])];
    if (allNames.map(name => normalizeText(name)).includes(normalizedInput)) {
      return color.hex;
    }
  }
  return null;
}

export function isColorProperty(propertyName) {
  if (!propertyName) return false;
  const normalizedPropertyName = propertyName.trim().toLowerCase();
  return EXPECTED_COLOR_PROPERTIES.map(x => x.toLowerCase()).includes(normalizedPropertyName);
}

export function getContrastColor(hexcolor) {
  if (!hexcolor || hexcolor.length < 7) return '#000000';
  const r = parseInt(hexcolor.substring(1, 3), 16);
  const g = parseInt(hexcolor.substring(3, 5), 16);
  const b = parseInt(hexcolor.substring(5, 7), 16);
  const y = (r * 299 + g * 587 + b * 114) / 1000;
  return y >= 128 ? '#000000' : '#FFFFFF';
}
