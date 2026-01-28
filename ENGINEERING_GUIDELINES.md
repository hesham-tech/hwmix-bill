# Engineering Guidelines - Permission System

## Overview

The HWMix Bill permission system is designed to provide granular access control (All, Self, Children) for all business entities. Every module must follow a standardized set of permission keys to ensure consistency and modularity.

## Standard Permission Pattern

For any entity (e.g., `Users`, `Invoices`, `Products`), the following keys must be defined in `src/config/permissions.js`:

| Key Suffix | Description |
| :--- | :--- |
| `_PAGE` | Access to the main module page/route. |
| `_VIEW_ALL` | Ability to view ALL records of this entity. |
| `_VIEW_CHILDREN` | Ability to view records created by subordinates/sub-companies. |
| `_VIEW_SELF` | Ability to view only own records. |
| `_CREATE` | Ability to create a new record. |
| `_UPDATE_ALL` | Ability to edit ALL records. |
| `_UPDATE_CHILDREN` | Ability to edit records of subordinates. |
| `_UPDATE_SELF` | Ability to edit only own records. |
| `_DELETE_ALL` | Ability to delete ANY record. |
| `_DELETE_CHILDREN` | Ability to delete records of subordinates. |
| `_DELETE_SELF` | Ability to delete only own records. |

## Implementation in Vue Components

### 1. Using the `can()` helper
Use the `usePermissions` composable to check permissions in templates or scripts.

```vue
<script setup>
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';

const { can } = usePermissions();
</script>

<template>
  <!-- Gating an entire section -->
  <div v-if="can(PERMISSIONS.INVOICES_VIEW_ALL)">
    <!-- Admin view -->
  </div>

  <!-- Gating an action button -->
  <AppButton 
    v-if="can(PERMISSIONS.WAREHOUSES_CREATE)"
    @click="handleCreate"
  >
    Add Warehouse
  </AppButton>
</template>
```

### 2. Using `AppDataTable`
`AppDataTable` handles standard actions (View, Edit, Delete) automatically and INCLUSIVELY if you provide the `permission-module`.

```vue
<AppDataTable
  permission-module="users"
  @view="handleView"
  @edit="handleEdit"
  @delete="handleDelete"
/>
```

**How it works:**
The component automatically constructs the granular keys based on the `permission-module` prop:
*   **View Action**: Checks `canAny('users.view_all', 'users.view_children', 'users.view_self')`.
*   **Edit Action**: Checks `canAny('users.update_all', 'users.update_children', 'users.update_self')`.
*   **Delete Action**: Checks `canAny('users.delete_all', 'users.delete_children', 'users.delete_self')`.

This ensures that any user with access to the data (at any level) can also use the corresponding action buttons if their permissions allow.

## Backend Sync
Every key added to `src/config/permissions.js` **MUST** have a corresponding key in the Laravel backend (`config/permissions_keys.php`) to ensure that API requests are also properly authorized.
