import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import apiClient from '@/api/axios.config';

window.Pusher = Pusher;

// export const echo = new Echo({
//   broadcaster: 'reverb',
//   key: import.meta.env.VITE_REVERB_APP_KEY || 'hwmix-key',
//   wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
//   wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
//   wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
//   forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
//   enabledTransports: ['ws', 'wss'],
//   authorizer: (channel, options) => {
//     return {
//       authorize: (socketId, callback) => {
//         apiClient
//           .post('broadcasting/auth', {
//             socket_id: socketId,
//             channel_name: channel.name,
//           })
//           .then(response => callback(false, response.data))
//           .catch(error => callback(true, error));
//       },
//     };
//   },
// });

export default app => {
  // window.Echo = echo;
  // app.config.globalProperties.$echo = echo;
};
