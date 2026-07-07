const isProduction = import.meta.env.PROD || import.meta.env.VITE_APP_ENV === 'production';

if (isProduction) {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}

