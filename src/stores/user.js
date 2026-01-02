// stores/user.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { getOne } from '@/services/api';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    userAll: null,
    isAuth: false,
    loadingApi: false,
    permissionsList: null,
  }),
  actions: {
    async initializeUser() {
      console.log('initializeUser');
      console.log(this.isAuth);

      if (!this.isAuth) {
        await this.fetchUser();
        console.log(!this.isAuth);
      }
    },

    async fetchUser() {
      this.loadingApi = true;
      try {
        const token = localStorage.getItem('authToken');
        if (!axios.defaults.headers.common['Authorization'] && token) {
          this.setAuthHeader(token);
        }
        const userId = this.getUserId();
        if (!userId) throw new Error('User ID not found');

        const { data } = await getOne('user', userId, { loading: true });
        this.user = data;
        // console.log('User initialized permissions :', JSON.stringify(this.user.permissions));
        this.isAuth = true;
        this.permissionsList = this.calculatePermissions(this.user);
      } catch (error) {
        if (error.status === 401) {
          this.logout();
        } else {
          console.error('Error fetching user:', error);
        }
      } finally {
        this.loadingApi = false;
      }
    },

    getUserId() {
      const user = localStorage.user ? JSON.parse(localStorage.user) : null;
      return user?.id || null;
    },

    setAuthHeader(token) {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        delete axios.defaults.headers.common['Authorization'];
        this.logout();
      }
    },

    logout() {
      delete axios.defaults.headers.common['Authorization'];
      this.isAuth = false;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      location.reload();
    },

    calculatePermissions(user) {
      // const rolesPermissions = user.roles.map(role => role.permissions).flat();
      // console.log('Roles Permissions:', rolesPermissions);
      // const permissions = user.permissions;
      // this.permissionsList = [...new Set([...rolesPermissions, ...permissions])];
      // return [...new Set([...rolesPermissions, ...permissions])];
      this.permissionsList = user.permissions;
      return user.permissions;
    },

    can(permission) {
      // console.log('Checking permission:', permission);

      if (!this.permissionsList) {
        console.warn('Permissions not calculated yet. Returning false.');
        return false;
      }
      if (Array.isArray(permission)) {
        return permission.some(perm => this.permissionsList.includes(perm));
      } else {
        return this.permissionsList.includes(permission);
      }
    },

    // async can(permission) {
    //   try {
    //     if (!this.user) {
    //       await this.fetchUser();
    //     }
    //     const allPermissions = this.calculatePermissions(this.user);
    //     if (Array.isArray(permission)) {
    //       return permission.some(perm => allPermissions.includes(perm));
    //     } else {
    //       return allPermissions.includes(permission);
    //     }
    //   } catch (error) {
    //     console.error('Error checking permissions:', error);
    //     return false;
    //   }
    // },
  },

  persist: true, // To persist the state even after refresh

  // Use this to trigger the action when the store is first used
  persistStore(store) {
    store.$onAction(() => {
      store.initializeUser(); // Automatically call initializeUser when any action is triggered
    });
  },
});
