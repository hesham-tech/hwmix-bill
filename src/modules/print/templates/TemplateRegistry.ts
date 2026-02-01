import type { PrintTemplate, ITemplateRegistry } from '../core/types';

/**
 * Registry for managing print templates
 * Implements singleton pattern for global access
 */
class TemplateRegistry implements ITemplateRegistry {
    private templates = new Map<string, PrintTemplate>();

    /**
     * Register a new print template
     * @param type - Unique template identifier (e.g., 'invoice', 'installment')
     * @param template - Template configuration
     */
    register<T = any>(type: string, template: PrintTemplate<T>): void {
        this.templates.set(type, template);
    }

    /**
     * Get a registered template
     * @param type - Template identifier
     * @returns Template configuration or undefined if not found
     */
    get(type: string): PrintTemplate | undefined {
        return this.templates.get(type);
    }

    /**
     * Check if a template is registered
     * @param type - Template identifier
     * @returns True if template exists
     */
    has(type: string): boolean {
        return this.templates.has(type);
    }

    /**
     * Get list of all registered template types
     * @returns Array of template identifiers
     */
    list(): string[] {
        return Array.from(this.templates.keys());
    }

    /**
     * Unregister a template (useful for testing/cleanup)
     * @param type - Template identifier
     * @returns True if template was removed
     */
    unregister(type: string): boolean {
        return this.templates.delete(type);
    }

    /**
     * Clear all registered templates (useful for testing)
     */
    clear(): void {
        this.templates.clear();
    }
}

// Export singleton instance
export const templateRegistry = new TemplateRegistry();
