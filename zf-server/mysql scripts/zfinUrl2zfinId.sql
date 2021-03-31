UPDATE transgene SET zfinId = REGEXP_REPLACE(zfinURL, 'https\:\/\/zfin.org\/','')
  WHERE zfinId IS NULL AND zfinURL IS NOT NULL;
