// We need a list of "possible values" or "known values" or "legal values"
// for given fields in given objects in order to implement auto-completion
// or validators or selectors

export class FieldOptions {
  options: {[key: string]: string[]};

  constructor(options: {[key: string]: string[]} = {}) {
    this.options = options;
  }

  // Fill the options from a plain object
  // Normally we receive a plain object from and HTTP request and we stick it in here.
  fillFromPlain(options: {[key: string]: string[]} = {}) {
    this.options = options;
  }


  filterOptionsContaining(key: string, searchString: string): string[] | null {
    if (this.options.hasOwnProperty(key)) {
      if (!searchString) {
        return this.options[key];
      } else {
        const filterValue = searchString.toLowerCase();
        return this.options[key].filter(o => o.toLowerCase().includes(filterValue));
      }
    } else {
      return null;
    }
  }

  filterOptionsStartingWith(key: string, searchString: string): string[] | null {
    if (this.options.hasOwnProperty(key)) {
      if (!searchString) {
        return this.options[key];
      } else {
        const filterValue = searchString.toLowerCase();
        return this.options[key].filter(o => o.toLowerCase().startsWith(filterValue));
      }
    } else {
      return null;
    }
  }
}

