import ProductStickerTemplate from './ProductStickerTemplate.vue';
import { templateRegistry } from '../TemplateRegistry';

// Register product sticker template
templateRegistry.register('product-sticker', {
    component: ProductStickerTemplate,
    styles: '', // Specific styles are in the component scoped style
    formats: ['sticker'],

    // Transform product data to template props
    transformData: (data) => {
        const { item, quantity, items } = data;

        // If we have a single item and a quantity, repeat it
        if (item && quantity) {
            const productData = {
                productName: item.product?.name || item.name || 'منتج',
                barcode: item.barcode || item.sku || '0000000000',
                price: item.retail_price || 0,
            };
            return {
                items: Array(quantity).fill(productData),
            };
        }

        return {
            items: items || [],
        };
    },
});

export { ProductStickerTemplate };
