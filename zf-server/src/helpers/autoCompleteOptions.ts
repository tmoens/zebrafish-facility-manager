// This is simply an associative array.
// In many cases the GUI client needs to know the valid set of values that can be used for
// a certain attribute of a certain object. For example, when it wants to populate a drop-down
// menu of the set researchers who are "known" in this facility.
// For every object there are is a different set of such attributes, but for every object
// the general shape of the array is always the same: a list of attributes, each with an
// array of known values.
interface AutoCompleteOptions {
  [index: string]: string[];
}
