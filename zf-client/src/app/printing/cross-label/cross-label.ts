// A cross label is just a bunch of data that describes a cross between
// two stocks and a bit of ancillary data like which researcher is doing the work.
// The data for a cross label is totally transient.  It is never stored in the
// the database.  It is basically an aide for people with bad handwriting to put
// a whole bunch of text on a small label in a consistent and legible way.
export class CrossLabel {
  researcherName: string = null;
  momName: string = null;
  dadName: string = null;
  momTank: string = null;
  dadTank: string = null;
  momDescription: string = null;
  momAlleleSummary: string = null;
  dadDescription: string = null;
  dadAlleleSummary: string = null;
  dateString: string = null;
  note: string = null;
  fontFamily: string = 'Arial';
  fontSize: number = 11;
}
