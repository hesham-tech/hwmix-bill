/**
 * Print Templates Index
 * Registers all templates for lazy loading
 */

import { templateRegistry } from './TemplateRegistry';

// Register templates for lazy loading
// Templates will only be imported when first requested

// Note: Since each folder has a single index.ts that registers all formats,
// we need to keep the current structure for now
// Future improvement: Split each format into separate files

// For now, we'll register them eagerly but the structure is ready for lazy loading
import './installment';
import './invoice';
import './payment';
import './product';

export { };
