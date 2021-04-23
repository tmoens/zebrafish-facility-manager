# Releases 2.1 - 2.4 April 2021

## Audit Tool

Using a phone only, make sure that the data in your system is in sync with
your fish facility.
Very fast and efficient update of the stocks and 
fish counts in tanks as you go from tank to tank.

## ZFIN Integration

When adding a mutation or transgene to the system, any alleles that are "known to
ZFIN" are recognized and user can import ZFIN information with a single click.

## Data Importer

An importer feature was added to simplify the process of migrating existing
stockbooks to the Zebrafish Facility Manager system.

# Release 2.0. February 2021

## Stock Researchers and Primary Investigators Improved

Previously these were simple strings in the database.
They are now references to user object which means:

1. End users can no longer create multiple different strings for the same researcher
1. Researcher filters will produce much more reliable results
1. Stock editing will be simpler

## User Administration Improved

In order to support the stocks referring to users as PIs or researchers, users
can now be designated as either or both.  Only "active" users will show up on
the menu of researchers that can be assigned to a stock.

More advanced filtering has been implemented for user administration.

## Label Printing Improved

Label printing has been greatly improved. The user is now able to preview and edit the
label contents before printing. In particular:

1. Edit data for the label, removing redundant information and adding notes
1. Hide or show fields
1. Make minor adjustments to the font and font size

## Cross Label Feature

The system supports creating a label for a particular cross.
The cross label builder will automatically provide data from the researcher,
date and the parental stocks - but the user can override this data if desired.

### Mutation "researcher" field becomes "source"

This is in keeping with the general usage of the field to track from where the mutation
was acquired.

# Release 1.0 September 2020

This was the original release includes:

1. Stock Management
1. Mutation Management
1. Transgene Management
1. User Administration
1. Tank Label Printing
1. Excel reports
1. Tank Walker


