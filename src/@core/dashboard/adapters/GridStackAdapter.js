import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.css';

/**
 * مغلف برمجى كامل لمكتبة GridStack.js لعزل عمليات الـ DOM والسحب والإفلات
 */
export class GridStackAdapterWrapper {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.grid = null;
    this.options = {
      column: 12,
      cellHeight: 'auto',
      margin: 10,
      minRow: 1,
      staticGrid: true,
      acceptWidgets: true,
      float: false,
      disableOneColumnMode: false,
      oneColumnModeDomSort: true,
      resizable: { handles: 'n,e,s,w,ne,nw,se,sw' },
      dragInOptions: { revert: 'invalid', scroll: false, appendTo: 'body', helper: 'clone' },
      ...options
    };
  }

  build(widgetInstances, onChangeCallback) {
    if (this.grid) {
      this.destroy();
    }
    this.grid = GridStack.init(this.options, this.container);
    this.grid.on('change', (event, items) => {
      if (onChangeCallback && items) {
        const changes = items.map(item => ({
          id: item.el.getAttribute('data-instance-id'),
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h
        }));
        onChangeCallback(changes);
      }
    });
  }

  makeWidgetEl(el) {
    if (!this.grid || !el) return;
    this.grid.makeWidget(el);
  }

  removeWidgetEl(el) {
    if (!this.grid || !el) return;
    this.grid.removeWidget(el, false, false);
  }

  loadLayout(items) {
    if (!this.grid) return;
    this.grid.load(items);
  }

  setStatic(isStatic) {
    if (!this.grid) return;
    this.grid.setStatic(isStatic);
  }

  enableDragAndDrop(enable) {
    if (!this.grid) return;
    this.grid.enableMove(enable);
    this.grid.enableResize(enable);
  }

  serialize() {
    if (!this.grid) return [];
    const items = this.grid.getGridItems();
    return items.map(el => {
      const node = el.gridstackNode;
      return {
        id: el.getAttribute('data-instance-id'),
        x: node.x,
        y: node.y,
        w: node.w,
        h: node.h
      };
    });
  }

  destroy() {
    if (this.grid) {
      this.grid.destroy(false);
      this.grid = null;
    }
  }
}
