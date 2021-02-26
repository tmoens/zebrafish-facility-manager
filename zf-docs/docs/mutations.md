# Mutations And Transgenes

The system allows you to manage all the mutations and transgenes in use in your facility.

The benefits you get by doing this carefully are:

1. all references to a mutation or transgene will be consistent from stock to stock.
The user never has to guess at any of the many and varied spellings of a transgene in order
to find stocks that carry it.
1. the user should **never** have to type in the name of a mutation or transgene when
editing information associated with a stock.
(The days of sorting out the textual variants of Tg(Rab11a:GFP) 
like Rab11GFP, Rab11-GFP, rab11agfp, Rab11a-gfp, Rab11agfp are thankfully behind you.)
1. following the lineage of a stock with respect to a mutation or transgene.
is both simple and accurate.
1. searching for stocks containing a mutation or transgene becomes very fast and accurate.
1. when a name of a transgene or mutation changes (and they do), by editing the mutation
you automatically change the presentation of that mutation everywhere in the system.

None of these advantages are available if you track mutations or transgenes using text
in the description of a stock.

While the main function the system provides is to associate mutations with stocks there are several things
you can do to make sure the system work as well as possible in your facility.

## Best Practices

### When do you add a Mutation to the system?

The simple answer: as soon as possible.

#### Case 1 - you receive a stock or sperm from outside

Let's say you receive a stock from another lab, and it is known to carry smo^hi229Tg: Tg(F5).
Add it to the system now.
As soon as it or its offspring are in a tank in your facility - make sure you assign Tg(F5) to that stock
and after that the system will take care of moving the stock forward through its progeny.

Of course, if Tg(F5) is not inherited of a particular line of progeny, the system allows you to mark it accordingly.

#### Case 2 - you are developing a new mutation (or transgene)

This is a little more tricky because for the first few generations,
the individuals in a stock may carry multiple mutations none of which have been identified.

When you have isolated a mutation, it is time to put it in the system and associate it with the stock.
It does not matter if you have fully identified the mutation or not, just get it in the system as soon
as you feel it is "promising". After that, let the system help you track it through subsequent generations.

If you wait too long, the lineage of the novel mutation may miss a few generations.

While the mutations are "under development" you will use the stock's description and comments to
keep track of exactly what is going on.

### Nicknames

Some transgenes names are getting pretty long. Take, for example, Tg(8xgli-Xla.Cryaa:NLS-d1mCherry)^st1002.
This name does not lend itself to printing on a 3" by 1" tank label, especially if the stock has several
other transgenes and mutations that need to go on there.
Equally, it is hard to read on a screen or a phone.

This is where **nicknames** come in.
You can give a transgene (or a mutation) a nickname and that nickname will be used in place of all the long
name everywhere in the system, including on tank labels.
When you choose a nickname it should be:

1. shorter than the actual name.
1. still be descriptive. Using the allele name like st1002 is a bad idea because.
many users will not know immediately what that is.
But maybe gli:dsmCherryNLS is good enough?
1. unambiguous.  If you have Tg(mpeg1.1:mScarlet-CAAX-CG2)^co62, Tg(mpeg1.1:GCaMP6s-CAAX-CR2)^65, 
and Tg(mbpa:EGFP-Caax-polyA-CG2)^co58, choosing nice, short, unambiguous nicknames might be hard.

The great thing about nicknames is that you can change them.
So if you made a choice early on and later it turns out to ambiguous, no problem - change it to disambiguate.
Changes are immediate and take place throughout the system for every stock having the nicknamed mutation or transgene.

### "Owned" Transgenes and Mutations

Transgene nomenclature in ZFIN has a "Construct" which tries to unambiguously describe it.
It also has a "Genomic Feature Name" (formerly called "allele") which identifies the organization from which the
transgene originated and a serial number. Mutation nomenclature includes a gene and an "allele".
The allele is also a combination of an organization identifier and a serial number. 

If you create an "owned" mutation or transgene in your facility, the system will automatically
assign it the appropriate allele or genomic feature name complete with serial number.

For example, the Fred Hutchinson Cancer Research Center uses the identifier *fh* for all 
of its alleles or genomic feature names.
If the last "owned" mutation was fh234, and a user
creates an "owned" transgene, the system will automatically assign it the Genomic Feature Name fh235.

Numbers are free and plentiful, so feel free to create "owned" transgenes and mutations speculatively.

If you want to assign "owned" alleles yourself,
you can do that, but you will have a bit of work to do to make sure you choose the next serial number and that
all other users have a way of knowing you have "taken one."


### What information should you track?

The Mutation Manager allows you to track many aspects of a mutation including the phenotype, the base pair change, 
the amino acid change, the method used to create it,
and even a url for the mutation in ZFIN - if the mutation is known there.

It is up to you, and the users of your facility, to decide on how much information to track in the system.
But it will be very accessible to all users than tracking this information in shared spreadsheets.

### Informal Wild-Type Mutation Hack

Some facilities track each of their wild-types as separate (fake) mutations that are only ever used for
wild-type stocks.  This allows them to gain all the advantages of mutation tracking for wild-type stocks.

