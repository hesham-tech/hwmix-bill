import ProductStickerTemplate from './ProductStickerTemplate.vue';
import { templateRegistry } from '../TemplateRegistry';

import stickerStyles from './product.print.css?raw';

// Register product sticker template
templateRegistry.register('product-sticker', {
  component: ProductStickerTemplate,
  styles: stickerStyles,
  formats: ['sticker'],
  requireVerification: true,

  // Transform product data to template props
  transformData: (data) => {
    const { item, quantity, items } = data;

    // If we have a single item and a quantity, repeat it
    if (item && quantity) {
      const productName = item.product?.name || item.name || 'منتج';
      const barcodeValue = item.barcode || item.sku || '0000000000';
      const price = item.retail_price || 0;

      return {
        items: Array.from({ length: quantity }, (_, i) => ({
          productName,
          barcode: barcodeValue,
          price,
          id: `bc-${item.id || 'new'}-${i}-${Date.now()}`
        })),
      };
    }

    return {
      items: items || [],
    };
  },
});

export { ProductStickerTemplate };
