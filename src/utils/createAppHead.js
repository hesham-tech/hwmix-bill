import { createHead } from '@unhead/vue/client';
import { DeprecationsPlugin } from '@unhead/vue/plugins';

export function createAppHead() {
  // Vuetify 3.6 emits style.children; Unhead 2 needs this compatibility plugin
  // to render it as CSS rather than an inert HTML attribute.
  return createHead({ plugins: [DeprecationsPlugin] });
}
