-- if import testing fails, some things get left behind
-- here is how you get rid of them
-- if things go really badly, you have to clear the stocks
-- by hand because they may contain references to other stocks and
-- may not be deleted properly.
delete
from stock
where 1;
delete
from transgene
where 1;
delete
from mutation
where 1;
delete
from user
where role != 'admin';
