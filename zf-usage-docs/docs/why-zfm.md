# Why Use Zebrafish Facility Manager

## Accessibility

The Zebrafish Facility Manager is a web application that runs in any modern browser.
It has been developed to work on large screens, tablets and even phones.

Since it is web-based, the information is always at hand.

## Consistency

We have designed the system to avoid a common problem in other systems.
Here is an example of the "consistency" problem.
We migrated a Filemaker Pro system where many of the stocks carried
Tg(fli1:EGFP)^y1Tg.  When the user wanted to indicate this, in
the FileMaker Pro system, they simply
typed the string "fli1:EGFP" in the stock description.
Over time, these are the various tokens that ended up in the stock
descriptions of their 384 stocks with y1Tg:

|Token           |Count|
|----------------|-----|
|fli|168|
|fli1:egfp|91|
|Fli:GFP|32|
|Fli:EGFP|24|
|fli1 EGFP|11|
|tg(fli1:EGFP)|9|
|fli1EGFP|8|
|fli: GFP|8|
|fli1: EGFP|6|
|fli EGFP|5|
|fli1a:eGFP|4|
|tg(fli1EGFP)|3|
|fli1a;eGFP|2|
|Fli 1: EGFP|2|
|fli1;EGFP|2|
|Fli GFP|1|
|fli :EGFP|1|
|Fli 1 : EGFP|1|
|Fli 1 gfp|1|
|fli background|1|
|fli;eGFP|1|
|flieGFP|1|
|tg (fli1;EGFP)|1|
|fl1:eGFP|1|

The problem with this is that it is impossible to accurately search in
this database nor even to track allele lineage.
In other systems this type of problem recurs not only with alleles, but also with
researcher names, PI names, mutation type, screen types and tank names.

## Storing Relationships

The ZFM system avoids these problems with a simple technique.
Going back to the y1Tg problem for an example, the solution works like this:
A user adds the y1Tg to the system in exactly one place and 
gives it a construct name of fli1:eGFP.
When stock S2984.01 is designated as having that transgene, that relationship
is stored as a reference from stock S2984.01
to the one and only copy of y1Tg.

Later, if the user were to change the information associated with y1Tg, for example
changing the construct name to Tg(fli1:EGFP),
all stocks having that transgene are always automatically kept up to date.

So, in the system, users can perform searches for
exactly the set of stocks that have y1Tg or Tg(fli1:EGFP) with complete confidence.

Similarly, no information about a parent of a stock
is kept as part of the stock record.
Instead, the system keeps track of the relationship between a stock and its
parent stock.

We use the same technique for storing relationships between stocks and their
descendents, mutations, researchers, PIs, and the tanks they are swimming in.

This makes searching and navigating over those relationships 
simple and error-free.

## Functionality for Stock Management

The Zebrafish Facility Manager provide a large amount of functionality in a
simple user interface.

### Focus Through Filtering

Users can focus on the tasks at hand by filtering the stock browser to their needs.
1. A researcher can focus on their own stocks, focusing on those with a particular allele
1. A researcher can focus on only those of their stocks that are currently in the nursery
1. A researcher can look for any living stock in the facility that carries a particular allele
1. A user can very quickly navigate to a particular known stock number
1. A normal husbandry practice is to search for stocks that are older than some threshol
1. Users may leave "ToDo" notes in their comments and find
   those or other test patterns in the stock comments
   
### Adding/Updating Stock Information

The system makes it easy to add a new stocks to the facility -
whether the stock is from an external source or from a
cross done at the facility.
Stock numbering is handled automatically but so too is the inheritance of traits
from internal parents.
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

The system allows users to trace backwards and forwards through the stock lineage.
Sufficient information is presented in the interface to let the user choose
the parent or offspring that caries a particular trait.

### Tank Label Printing (With QR Code)

The system can be used to generate a tank label including QR code for a particular stock.
The QR code allows a user in the facility to point at that QR code and jump
right to the stock in the system.
The system provides default content for a label, but users can edit it to fit the
confines of their labels.

### Cross Label Printing

When the user selects two stocks to cross, the system will print out a label
with the appropriate identifying information for the cross.
Again, the user can add whatever notes they want to the label.

### Facility Audit

Using a phone only, make sure that the data in your system is in sync with
your fish facility.
Very fast and efficient update of the stocks and
fish counts as you go from tank to tank.

### Tank Walker

Any time the user sets a filter (for example, stocks over 800 days old, or "my stocks")
they can use the *Tank Walker* feature on their phone
to make an ordered walk to the tanks that
contain those stocks.

### Stock Report

All the data about stocks exported to excel.

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
an alternate gene name for the mutation. Users can then search on either the new
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
