import { createServer } from 'vite';

async function run() {
  const server = await createServer({
    configFile: './vite.config.js',
    server: { middlewareMode: true }
  });
  try {
    console.log('Transforming UnitGroupWizardDialog.vue...');
    const result = await server.transformRequest('/src/modules/settings/components/units/UnitGroupWizardDialog.vue');
    console.log('Transform successful!', result ? 'Got compiled JS' : 'No output');
  } catch (err) {
    console.error('Transform failed with error:');
    console.error(err);
  } finally {
    await server.close();
  }
}

run();
