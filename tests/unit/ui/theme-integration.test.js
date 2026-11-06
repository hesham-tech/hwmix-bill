import { createApp, h, nextTick } from 'vue';
import { createVuetify } from 'vuetify';
import { renderDOMHead } from '@unhead/vue/client';
import { createAppHead } from '@/utils/createAppHead';
import { themes } from '@/plugins/vuetify/theme';

describe('Vuetify theme and Unhead integration', () => {
  it('renders live theme CSS alongside page metadata', async () => {
    const head = createAppHead();
    const app = createApp({ render: () => h('div') });
    const vuetify = createVuetify({ theme: { defaultTheme: 'light', themes } });
    app.use(head);
    app.use(vuetify);
    const container = document.createElement('div');
    document.body.append(container);
    app.mount(container);
    const metadata = head.push({ title: 'صفحة تجريبية', meta: [{ name: 'description', content: 'اختبار الألوان' }] });

    try {
      await renderDOMHead(head);
      const stylesheet = document.getElementById('vuetify-theme-stylesheet');
      expect(stylesheet.textContent).toContain('--v-theme-primary: 0,134,205');
      expect(stylesheet.textContent).toContain('.bg-primary');
      expect(stylesheet.hasAttribute('children')).toBe(false);
      expect(document.title).toBe('صفحة تجريبية');

      vuetify.theme.global.name.value = 'cozy';
      await nextTick();
      await renderDOMHead(head);
      expect(stylesheet.textContent).toMatch(/^:root \{\s*--v-theme-background: 249,246,240/);
      expect(document.querySelectorAll('#vuetify-theme-stylesheet')).toHaveLength(1);
    } finally {
      metadata.dispose();
      app.unmount();
      container.remove();
      document.getElementById('vuetify-theme-stylesheet')?.remove();
    }
  });
});
