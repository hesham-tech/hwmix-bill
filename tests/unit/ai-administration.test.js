import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn(), user: { isStaff: true, hasPermission: vi.fn() }, auth: { isAuthenticated: true } }));
vi.mock('@/api/axios.config', () => ({ default: mocks }));
vi.mock('@/stores/user', () => ({ useUserStore: () => mocks.user }));
vi.mock('@/stores/auth', () => ({ useAuthStore: () => mocks.auth }));
import routes from '../../src/modules/ai-platform/routes';
import { PERMISSIONS } from '../../src/config/permissions';
import { updateAiPrompt, deleteAiPrompt, toggleAiPromptActive, updateAiAccount } from '../../src/modules/ai-platform/services/aiPlatformService';

beforeEach(() => vi.clearAllMocks());

describe('AI administration boundary', () => {
  it('requires system administrator permission on all six actual page routes', () => {
    expect(routes).toHaveLength(6);
    for (const route of routes) {
      expect(route.meta.requiresAuth).toBe(true);
      expect(route.meta.permission).toEqual([PERMISSIONS.ADMIN_SUPER]);
    }
  });
  it('preserves company prompt scope without copying a tenant selector', () => {
    updateAiPrompt(5, { title: 'Company', company_id: 2 });
    expect(mocks.put).toHaveBeenCalledWith('/ai/admin/prompts/5', { title: 'Company', is_system: false });
  });
  it('marks global prompt updates explicitly', () => {
    updateAiPrompt(3, { title: 'Global', company_id: null });
    expect(mocks.put).toHaveBeenCalledWith('/ai/admin/prompts/3', { title: 'Global', is_system: true });
  });
  it('sends global and company delete/toggle scope on the existing endpoints', () => {
    deleteAiPrompt(3, true); toggleAiPromptActive(3, true);
    expect(mocks.delete).toHaveBeenCalledWith('/ai/admin/prompts/3', { params: { is_system: 1 } });
    expect(mocks.patch).toHaveBeenCalledWith('/ai/admin/prompts/3/toggle', { is_system: true });
    deleteAiPrompt(5); toggleAiPromptActive(5);
    expect(mocks.delete).toHaveBeenCalledWith('/ai/admin/prompts/5', { params: { is_system: 0 } });
    expect(mocks.patch).toHaveBeenCalledWith('/ai/admin/prompts/5/toggle', { is_system: false });
  });
  it('does not echo account company metadata as a requested tenant switch', () => {
    updateAiAccount(7, { label: 'Updated', company_id: 2, api_key_encrypted: '' });
    expect(mocks.put).toHaveBeenCalledWith('/ai/admin/accounts/7', { label: 'Updated', api_key_encrypted: '', is_system: false });
  });
});
