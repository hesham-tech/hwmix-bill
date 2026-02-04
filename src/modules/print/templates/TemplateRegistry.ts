import type { PrintTemplate, ITemplateRegistry } from '../core/types';

/**
 * Registry for managing print templates
 * Implements singleton pattern for global access
 * Supports lazy loading of templates
 */
class TemplateRegistry implements ITemplateRegistry {
    private templates = new Map<string, PrintTemplate>();
    private loaders = new Map<string, () => Promise<void>>();
    private loadingPromises = new Map<string, Promise<void>>();

    /**
     * Register a new print template
     * @param type - Unique template identifier (e.g., 'invoice', 'installment')
     * @param template - Template configuration
     */
    register<T = any>(type: string, template: PrintTemplate<T>): void {
        this.templates.set(type, template);
    }

    /**
     * Register a lazy-loaded template
     * @param type - Template identifier
     * @param loader - Function that imports and registers the template
     */
    registerLazy(type: string, loader: () => Promise<void>): void {
        this.loaders.set(type, loader);
    }

    /**
     * Get a registered template (loads lazily if needed)
     * @param type - Template identifier
     * @returns Template configuration or undefined if not found
     */
    async get(type: string): Promise<PrintTemplate | undefined> {
        // If template is already loaded, return it
        if (this.templates.has(type)) {
            return this.templates.get(type);
        }

        // If template has a lazy loader, load it
        if (this.loaders.has(type)) {
            await this.ensureLoaded(type);
            return this.templates.get(type);
        }

        return undefined;
    }

    /**
     * Get a registered template synchronously (without lazy loading)
     * @param type - Template identifier
     * @returns Template configuration or undefined if not found
     */
    getSync(type: string): PrintTemplate | undefined {
        return this.templates.get(type);
    }

    /**
     * Ensure a template is loaded
     * @param type - Template identifier
     */
    private async ensureLoaded(type: string): Promise<void> {
        // If already loading, wait for existing promise
        if (this.loadingPromises.has(type)) {
            await this.loadingPromises.get(type);
            return;
        }

        // If already loaded, return immediately
        if (this.templates.has(type)) {
            return;
        }

        // Get loader
        const loader = this.loaders.get(type);
        if (!loader) {
            return;
        }

        // Start loading
        const loadingPromise = loader().catch(error => {
            console.error(`Failed to load template '${type}':`, error);
        });

        this.loadingPromises.set(type, loadingPromise);
        await loadingPromise;
        this.loadingPromises.delete(type);
    }

    /**
     * Check if a template is registered
     * @param type - Template identifier
     * @returns True if template exists
     */
    has(type: string): boolean {
        return this.templates.has(type) || this.loaders.has(type);
    }

    /**
     * Get list of all registered template types
     * @returns Array of template identifiers
     */
    list(): string[] {
        const loadedTemplates = Array.from(this.templates.keys());
        const lazyTemplates = Array.from(this.loaders.keys());
        return [...new Set([...loadedTemplates, ...lazyTemplates])];
    }

    /**
     * Unregister a template (useful for testing/cleanup)
     * @param type - Template identifier
     * @returns True if template was removed
     */
    unregister(type: string): boolean {
        this.loaders.delete(type);
        return this.templates.delete(type);
    }

    /**
     * Clear all registered templates (useful for testing)
     */
    clear(): void {
        this.templates.clear();
        this.loaders.clear();
        this.loadingPromises.clear();
    }
}

// Export singleton instance
export const templateRegistry = new TemplateRegistry();

