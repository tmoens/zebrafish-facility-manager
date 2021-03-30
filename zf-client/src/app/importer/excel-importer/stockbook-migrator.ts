import * as XLSX from 'xlsx';
import { WorkBook, WorkSheet} from 'xlsx';
import {ZfGenericDto} from '../../zf-generic/zfgeneric-dto';

export class StockbookMigrator  {

  migrateStockbook(wb: WorkBook) {
    // We are going to get all the tokens in the sheet taking special
    // notice of anything that looks like an allele
    const tally = new TokenCounter();
    const ws: WorkSheet = wb.Sheets[wb.SheetNames[0]];
    XLSX.utils.sheet_to_json(ws, {header: 1}).map((row: string[]) => {
      row.map((cell: string) => {
        // We are in any cell of the worksheet.
        this.processToken(cell, tally)
      })
    })
    tally.dump();
  }
  processToken(rawToken: string, tally: TokenCounter) {
    if (!rawToken) return;

    // begin the process of tidying up the token by converting to lower case.
    let tidyToken: string = String(rawToken).trim();
    tidyToken = tidyToken.toLowerCase();


    // We treat ";" as a token separators so split the token if you find any
    let tokens: string[] = tidyToken.split(';');
    if (tokens.length > 1) {
      console.log('; split - ' + tidyToken);
      tokens.map((token: string) => this.processToken(token, tally));
      return;
    }

    // We treat " " (space) as a token separators so split the token if you find any
    // Of course this screws up things like "fli1a : egfp" or worse, "roy ^ a9"
    // so we may be wise to try both ways: splitting spaces or throwing them away
    // neither will work if we have something like "blah blah blah roy ^ a9, blah fli1a: gfp"
    // TODO consider making an exception for spaces inside parens: Tg(xxx: yyy)
    tokens = tidyToken.split(' ');
    if (tokens.length > 1) {
      console.log('space split - ' + tidyToken);
      tokens.map((token: string) => this.processToken(token, tally));
      return;
    }


    // we treat "something x something_else" as two tokens
    // so split the token if you " x ".
    tokens = tidyToken.split(' x ');
    if (tokens.length > 1) {
      console.log('" x " split - ' + tidyToken);
      tokens.map((token: string) => this.processToken(token, tally));
      return;
    }

    // Tidy up the token so that we do not end up repeating
    // searches for mild typographical variants of the same string
    // search tokens can only have digits, letters,
    // ":", "-", "(", and ")" for transgenes
    // Get rid of everything else
    tidyToken = tidyToken.replace(/[^\d^a-z^,^-^.^(^)^:]/g, '');
    console.log(`Raw token: ${rawToken}, Tidy token: ${tidyToken}`);
    tally.tally(tidyToken);
  }

}

class TokenCounter {

  tokens: Map<string, TokenData > = new Map<string, TokenData>();

  tally(token: string) {
    // look for the ^ - it's the best.
    const hatAt = token.indexOf('^');
    if ( hatAt > -1) {
      // the part after the hat is almost certainly and allele name
      const allele = token.substr(hatAt + 1);
      this.bump(allele, TokenQuality.ALLELE);

      // the part before the hat is likely a mutation
      const prefix = token.substr(0, hatAt)
      this.bump(prefix, TokenQuality.POSSIBLE_GENE);
      return;
    }

    // most alleles look like this: fh273 or au101Tg
    // very rarely la02117a (trailing alpha)
    // unfortunately some genes look lie that too mpl17, or fli1a for example.
    // ending in Tg or Gt however is a dead giveaway
    if (token.match(/^[a-z]+\d+tg$/)) {
      this.bump(token, TokenQuality.ALLELE);
      return;
    }
    if (token.match(/^[a-z]+\d+gt$/)) {
      this.bump(token, TokenQuality.ALLELE);
      return;
    }
    // letters folowed by digits
    if (token.match(/^[a-z]+\d+$/)) {
      this.bump(token, TokenQuality.POSSIBLE_ALLELE_OR_GENE);
      return;
    }
    // letters followed by digits followed by exactly one letter
    if (token.match(/^[a-z]+\d+[a-z]$/)) {
      this.bump(token, TokenQuality.POSSIBLE_ALLELE_OR_GENE);
      return;
    }

  }
  bump(token: string, tq:TokenQuality) {
    if (this.tokens.has(token)) {
      this.tokens.get(token).bump();
    } else {
      console.log('has no ' + token);
      this.tokens.set(token, new TokenData(tq));
    }
  }

  dump(tq: TokenQuality = null) {
    let sortedTokens: string[] = [];
    for (const key of this.tokens.keys()) {
      if ( !tq || this.tokens.get(key).hasQuality(tq)) {
        sortedTokens.push(key);
      }
    }
    sortedTokens = sortedTokens.sort((a, b) => {
      if (a > b) {
        return 1;
      } else {
        return -1;
      }
    });
    sortedTokens.map((t: string) => {
      console.log(`token: ${t}`);
      this.tokens.get(t).dump();
    });
  }
}

class TokenData {
  constructor(
    private quality: TokenQuality,
    private count: number = 1,
  ) {
  }
  hasQuality(tq: TokenQuality) {
    return (tq === this.quality);
  }
  bump() {
    this.count = this.count + 1;
    console.log(this.count);
  }
  dump() {
    console.log(`count: ${this.count}, quality: ${this.quality}`);
  }
}
enum TokenQuality{
  ANY = 'any',
  ALLELE = 'almost certainly and allele',
  PROBABLE_ALLELE = 'probably and allele',
  POSSIBLE_ALLELE_OR_GENE = 'looks like allele',
  TOO_LONG = 'too long to be of interest',
  TOO_SHORT = 'too short to be of interest',
  CONSTRUCT = 'looks like transgene construct',
  POSSIBLE_CONSTRUCT = 'might be a transgene construct',
  POSSIBLE_GENE = 'might be a gene',
}


