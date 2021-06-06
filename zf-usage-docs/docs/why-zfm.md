# Why Use Zebrafish Facility Manager?

The Zebrafish Facility Manager helps
Zebrafish researchers focus on their research with full confidence that their stock data
is easy to access, easy to manage and stored accurately and safely.

## Research Process Focus

The system has been developed in consultation with several zebrafish researchers
and facility managers to make sure their normal processes are simple to perform.
As new facilities come on board new requirements come to light, and the system continues
to grow to meet those needs.

## Modern Software Tools

The system uses modern software tools to allow users to access the system over
the internet on just about any kind of device.

The system uses Google's [Angular Material Component Library](https://material.io/components).
We take advantage of the huge investment Google has made into making consistent,
clean and accessible user interfaces.

## Good Design for Data Consistency

### The Consistency Problem

Some systems suffer from internal data inconsistency.
When a user wants to identify that a particular stock has a particular transgene,
they type in the name of the transgene while editing the stock.
This creates a relationship between the stock and the transgene.
Unfortunately the system does not check if that transgene is "known".
Different users may type in the transgene name differently.
For example, in a recent system that we migrated from FileMaker Pro, users had
typed in 24 different names for the same transgene.

The consequence of this is that there is no way to search such a system for
the stocks that have that transgene, because there is no unique way to identify
the transgene.

The same problem occurs for relationships between stocks and their
descendents, mutations, researchers, PIs, and the tanks they are swimming in.

### The Consistency Solution

The ZFM system avoids these problems.
In ZFM, when a user wants to identify that
a particular stock has a particular transgene, the system assists them
in selecting the transgene from a set of known transgenes.
Since transgenes are generally inherited, the system offers
the parental transgenes as automatic choices for any new stock or sub-stock.

The system then stores the relationship between the stock and the transgene.
So, name of the transgene can be changed without affecting any of the
stocks that have that transgene.

The system uses this same technique for all the relationships in the system
ensuring data consistency.

With the consistency problem solved, searching and navigating in the system are 
simple and error-free.

## Functionality for Stock Management

The Zebrafish Facility Manager provides a large amount of functionality in a
simple user interface.

### Focus Through Filtering

Users can filter stocks which allows them to focus on a task:

1. A researcher can focus on their own stocks, focusing on those with a particular allele
1. A researcher can focus on only those of their stocks that are currently in the nursery
1. A researcher can look for any living stock in the facility
1. A user can very quickly navigate to a particular known stock number
1. A facility manager can filter for stocks over a given age. 
   A normal husbandry practice is to refresh aging stocks.
1. Users may leave "ToDo" notes in their comments and find
   those or other strings in the stock comments
   
### Adding/Updating Stock Information

The system makes it easy to add a new stock to the facility -
whether the stock is from an external source or from a
cross done at the facility.
The system automatically handles stock numbering and the inheritance of genetic markers
to new stocks.
It's also easy to tell the system which tank(s) the stock is in and how many fish are
in the tank(s).
Users can come back and fill in details and comments at will.

### Substocks

As the researcher identifies traits in their subsets of a stock the system makes it easy to
create substocks and manage their traits.
Since substocks are all siblings of their base stocks, the system automatically maintains
consistency for fertilization dates and relationships to parents for all sub-stocks of the
same base stock.

### Lineage Navigation

When viewing a stock, the user also sees the parents and offspring of that stock, including
a summary of the transgenes and mutations of the parents and offspring.
So, users can navigate within the lineage keeping a particular transgene or mutation in focus. 

### Tank Label Printing (With QR Code)

The system can be used to generate a tank label including QR code for a particular stock.
The QR code allows a user in the facility to point at that QR code and navigate
to the stock in the system.
The system provides default content for a label, but users can edit it to fit the
confines of their labels.

### Cross Label Printing

When the user selects two stocks to cross, the system will print out a label
with the appropriate identifying information for the cross.
Again, the user can add whatever notes they want to the label.

### Facility Audit

Using only a phone, the user can make sure that the data in the system is in sync with
the physical fish facility.
This allows a very fast and efficient update of the stocks and
fish counts as you go from tank to tank.

### Tank Walker

Any time the user sets a filter (for example, stocks over 800 days old, or "my stocks")
they can use the *Tank Walker* feature on their phone
to guide them to the tanks that
contain those stocks.

### Stock Report

All the data about stocks can be exported to excel.

## Mutations and Transgenes

### Addition and Editing of Mutations and Transgenes

The system supports a simple way to add a new mutation or transgene with very minimal
effort.
It also provides room to fill in details as more information becomes known.

### Genes get renamed

The system stores a gene name as part of a mutation.
Sometimes these names change.
Users are able to update the gene name for a mutation at any time and the
mutation will show up properly.  For example, roy^a9 has become mpl17^a9.

But users are used to looking for "roy", so the system allows the user to store
an alternate gene name for the mutation. Users can then search on either the new,
or the alternate gene name.

### Automatic allele designation

If desired, the system can be used to track the facility's allele allocation
automatically.  If not, all the researchers at a facility
need to share some other way of choosing the next
"owned allele".

### Nicknames

A very powerful feature of the system is to allow the users to "nickname"
a transgene or mutation.
ZFIN construct names are getting longer in order to disambiguate them.
However, within the confines of a lab, that kind of disambiguation is overkill.
For example, a lab may use Tg(sox10:GAL4-VP16-IRES-EGFP)^el159Tg.
However, it is sufficient for them to talk about it as sox10:GAL4 because they
do not use any other transgenes that could be confused with it.
So they can simply assign a nickname of sox10:GAL4 for that transgene.
The system will use the nickname everywhere, including on tank labels.

If at a later date they also start to use Tg(-4.9sox10:NLS-2A-GAL4)^zf3044Tg,
the sox10:GAL4 nickname becomes ambiguous. 

No problem, by removing the nickname for
el159Tg, the system immediately uses the unambiguous full names for both transgenes.

### ZFIN Integration

The system is able to recognize mutation and transgene alleles that are
"known to ZFIN". The user interface offers
the user an option to import ZFIN information with a single click.

This enables the system to provide http links to ZFIN for any transgenes and
mutations that are "known to ZFIN".

## User Management

The system provides a simple but functional way of managing users.

Users can be assigned roles which limit their capabilities in the system.

Users can login, logout and rest their password in the usual ways.
