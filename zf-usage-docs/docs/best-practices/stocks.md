# Best Practice for Stocks and Substocks

The Zebrafish Facility Manager tracks three main things about your stocks:

1. their lineage - it is easy to navigate from a stock to its parents or offspring
1. the mutations and transgenes they carry
1. where they are housed in your fish facility (aka swimmers)

## What is a stock?

A stock is always a collection of fish that were generated on a single day by crossing 
fish from two single stocks, or by crossing fish from a single stock.

Every stock has a unique number that is allocated sequentially by the system.

By default, the system assigns all the genetic traits of their parents to new stocks.

## What is a sub-stock

A sub-stock is a group of fish from a stock partitioned by a set of common genetic traits.

All the fish of a sub-stock are siblings. 
They are also siblings of the original stock.
They are also siblings of all other sub-stocks of the same original stock.
But note that they are not siblings of any other stocks or sub-stocks.

A substock has the same stock number as the stock it was partitioned from,
but it also has a two digit suffix that is assigned sequentially by the system.

By default, the system assigns all the genetic traits of their parents to new sub-stocks.
The user must "deselect" the ones the sub stock does not have.

## Best Practices for stock management

### When to create a stock?

It is best to create a stock in the system as soon as you have a clutch which is ready
to go into the Nursery.
Best practice is to put those embryos in the special tank called "Nursery",
that way, they will be picked up by the "Live Stocks Only" filter.

### When to create a sub-stock?

It is best to create a sub-stock as soon as you have identified and partitioned
a subset of a stock who share a common set of genetic traits.

For this discussion, we will talk about an example stock called s3429 that *can* inherit
Tg1 and Tg2 and mutations m1 and m2 from their parents.

Because individuals of s3429 can have 4 separate traits, there are 14 possible combinations
of traits they can carry,
without taking homozygotes and heterozygotes into account.
The system allows you to create sub-stocks for any or all of the combinations.
Many of the combinations are not of interest and, if identified, the fish with those combinations may
be euthanized and a sub-stock with those traits never created.

#### Case 1: Embryos partitioned by visual inspection

If the embryos of a s3429 can be sorted into groups by visible traits before they go in the nursery,
create a separate sub-stock for each.  

1. The stock is assumed to have all the traits of both parents.
So, the group of embryos that expresses both Tg1 and Tg is the stock s3429.
There is no need to create a sub-stock for that group.
   
1. If one group expresses just Tg1, create sub-stock.
It will automatically be called s3429.
1. If another expresses just Tg2, create another sub-stock (s3429.02).
1. If a fourth group expresses neither, and they are of interest, you can create another sub-stock for them.

In all of these sub-stocks it is not yet clear if they carry m1 or m2 or both or 
neither - that can be determined later by genotyping.
For now, the system assumes all sub-stocks have both m1 and m2.

#### Case 2: Further partitioning by genotyping

A stock (or sub-stock) can be further separated into groups when they are genotyped,
typically by tail clipping.
For this example, we will look at the substock s3429.01.

1. If one group of s3429.01 is identified to have both m1 and m2,
There is no need to create a new sub-stock as s3429.01 is assumed to have both m1 and m2.
1. If a group is identified to have just m1, you can create a new sub-stock (s3429.03).
1. If a group is identified to have just m2, you can create a new sub-stock (s3429.04).
1. Again the group with neither m1 nor m2 may be of interest
and if it is, you can create another sub-stock (s3429.05).

You will notice that a sub-sub-stock like s3429.01.01 is totally unnecessary because 
a) it is just another sibling group from s3429 and b) it does not matter if that group was identified directly from
s3429 or from s3429.01.

#### Case 3: Homozygotes and heterozygotes

If the parents of s3429 both carry m2, then there is a further
distinction that can be made in the offspring.
Any of the sub-stocks with m2 identified so far, can be either homozygous or heterozygous for m2.
If you determine separate s3429.04 into HETs and HOMs, you can create 
a new sub-stock (which might be s3429.11) for the HOMs.
But then you need to distinguish between the s3429.04 and s3429.11 and the only way to do
that right now is in the description or the comment of the substocks.
s3429.04 might say "m2 HETS" and s3429.11 might say "m2 HOMs".

At a later date, the system may allow you to mark a trait as HET or HOM in every stock and substock 
(with HET being the default).

### When not to create a stock?

In general, don't create a stock for a subset of siblings of another stock.
That's what sub-stocks are for.
Note that if you do create a different stock for a subset of siblings, you lose
track of the fact that the two stocks came from the same cross.
You will also have to duplicate all the information that comes free when you create a sub-stock.
Specifically parent identity, and fertilization dates.


### Keep genetic markers up to date

Associate a stock with mutations and/or transgenes as soon as possible.
If a mutation or transgene is not in the system [add it now](mutations.md#when-do-you-add-a-mutation-to-the-system).
This bit of work, when performed early, makes for smooth sailing from then on.

### Keep your swimmers up to date

As soon as a stock or sub-stock goes in a tank - enter that in the system.
This enables a rich set of functionality not available otherwise:

1. you will know which stocks are alive! The "live stocks only" filter only shows stocks that are in tanks.
1. anyone can find any stock in the facility without having to interrupt other people's work.
1. you can find your own stocks in the facility.
1. you can produce tank labels that consistently and unambiguously annotate what the stock in a given tank is.
1. you can audit your facility efficiently.
1. you can use the super cool "Tank Walker" feature on your phone. 
You say what stocks you are interested in, and the Tank Walker leads you from one tank to the next.

### Use of the *description* field

Use the description field sparingly. Use it for:

1. something particularly compelling about a stock.
1. that these are potential founders from an injection.
1. brief comment about F0s F1s and F2s before mutations or transgenes have been isolated,
identified and added to the system.
([See also](mutations.md#when-do-you-add-a-mutation-to-the-system) adding new mutations or transgenes to the system).
1. if a sub-stock are all heterozygotes or homozygotes for a particular trait.
1. for wild-type stocks you might want to track what kind of wild-type it is in the description.
If you do, do it consistently.

Do not duplicate information that is already part of the stock data:

1. there is no point in saying that the stock is a cross between s2231 and s2917.04 because
the stock view shows both parents and the genetic traits of the parents.
1. there is no point in typing the genetic traits of a stock in its description because those are
always shown for every stock
wherever it shows up in the user interface.
History shows that there are wild variances in the way people type in strings that represent any given trait.

Try to keep descriptions short.
If you are using them on your tank labels long ones will not fit.

The description field is simple text, if you are going to use it extensively, try to make sure it is used
consistently by all the users of your system.  If you are consistent, you have a fighting chance
to do useful searches on the description.

Often the "comment" field is a better place to write detailed stock-specific information.

### Use of the nursery counts

It is good practice to enter the counts of fish entering and leaving the nursery.
By doing so you provide data for nursery mortality rates and for
animal husbandry reports in the future.

### Informal "To-do"

The system does not have a "To-do" list capability, but it does support an informal approach.
If there is something that you need to remember to do with a stock, simply add the string "To-do" in the comment field
and then use the "search text" area to find stocks so marked.

You do not have to use "To-do" specifically.  "TODO" or "To-Do" is also fine.
Just make sure all your users are consistent in the way they use it.


