// a make-shift class for a bunch of ZfGenerics indexed by their id.  Plus a
// counter.  Each item also has a "selected" status.
// Makes life easier for lookups: e.g. is this parental mutation in this stock?
// I could (should?) have used a Map, but this thing has the advantage that both
// the index and the data are typed.

import {ZfGenericClass} from '../zf-generic/zfgeneric-class';

export class ZfSelectionList<OBJ extends ZfGenericClass> {
  count = 0;
  items: {[id: number]: {item: OBJ, selected: boolean}} = {};
  constructor() {
  }

  insert(item: OBJ, selected = false) {
    if (!this.items[item.id]) { this.count++; }
    this.items[item.id] = {item: item, selected: selected};
  }

  remove(item: OBJ) {
    this.removeId(item.id);
  }
  removeId(id: number) {
    if (this.items[id]) {
      this.count--;
      delete this.items[id];
    }
  }

  contains(item: OBJ) {
    return this.containsId(item.id);
  }
  containsId(id: number) {
    return !!(this.items[id]);
  }

  getList(): ZfGenericClass[] {
    return Object.values(this.items).map(item => item.item);
  }
}
