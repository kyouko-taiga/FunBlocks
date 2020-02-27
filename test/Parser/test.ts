import { tokenize } from '../../src/Parser/Lexer';

describe("Lexer", () => {
  test("should return array of tokens", () => {

    const programInput = `
    init cons(1, cons(2, empty)) ;

    type List $T :: empty | cons $T (List $T) ;`;

    // const actual = Array.from(tokenize(' Abb , cbb Nov Ra'));
    const actual = Array.from(tokenize(programInput));

    // token0 is the '\n' character
    const token0 = {
      kind: 12, range: {
        lowerBound: { line: 1, column: 1, offset: 0 },
        upperBound: { line: 2, column: 1, offset: 1 }
      }
    }
    expect(actual[0]).toEqual(token0);

    // token1 is the 'init' keyword 
    const token1 = {
      kind: 1, range: {
        lowerBound: { line: 2, column: 5, offset: 5 },
        upperBound: { line: 2, column: 9, offset: 9 }
      }
    }
    expect(actual[1]).toEqual(token1);
    // token2 is the 'cons' identifier
    const token2 = {
      kind: 5, range: {
        lowerBound: { line: 2, column: 10, offset: 10 },
        upperBound: { line: 2, column: 14, offset: 14 }
      }
    }
    expect(actual[2]).toEqual(token2);
    // token3 is '(' and it is Unrecognized 
    const token3 = {
      kind: 14, range: {
        lowerBound: { line: 2, column: 14, offset: 14 },
        upperBound: { line: 2, column: 15, offset: 15 }
      }
    }
    expect(actual[3]).toEqual(token3);
    // token4 is the '1' identifier
    const token4 = {
      kind: 5, range: {
        lowerBound: { line: 2, column: 15, offset: 15 },
        upperBound: { line: 2, column: 16, offset: 16 }
      }
    }
    expect(actual[4]).toEqual(token4);
    // token5 is the ','
    const token5 = {
      kind: 10, range: {
        lowerBound: { line: 2, column: 16, offset: 16 },
        upperBound: { line: 2, column: 17, offset: 17 }
      }
    }
    expect(actual[5]).toEqual(token5);
    // token6 is the 'cons' identifier
    const token6 = {
      kind: 5, range: {
        lowerBound: { line: 2, column: 18, offset: 18 },
        upperBound: { line: 2, column: 22, offset: 22 }
      }
    }
    expect(actual[6]).toEqual(token6);
    // token7 is '(' and it is Unrecognized
    const token7 = {
      kind: 14, range: {
        lowerBound: { line: 2, column: 22, offset: 22 },
        upperBound: { line: 2, column: 23, offset: 23 }
      }
    }
    expect(actual[7]).toEqual(token7);
    // token8 is the '2' identifier
    const token8 = {
      kind: 5, range: {
        lowerBound: { line: 2, column: 23, offset: 23 },
        upperBound: { line: 2, column: 24, offset: 24 }
      }
    }
    expect(actual[8]).toEqual(token8);
    // token9 is the ','
    const token9 = {
      kind: 10, range: {
        lowerBound: { line: 2, column: 24, offset: 24 },
        upperBound: { line: 2, column: 25, offset: 25 }
      }
    }
    expect(actual[9]).toEqual(token9);
    // token10 is the 'empty' identifier
    const token10 = {
      kind: 5, range: {
        lowerBound: { line: 2, column: 26, offset: 26 },
        upperBound: { line: 2, column: 31, offset: 31 }
      }
    }
    expect(actual[10]).toEqual(token10);
    // token11 and token 12 are ')' : omitted
    // token 13 is the semicolon
    const token13 = {
      kind: 11, range: {
        lowerBound: { line: 2, column: 34, offset: 34 },
        upperBound: { line: 2, column: 35, offset: 35 }
      }
    }
    expect(actual[13]).toEqual(token13);
    // token 14 is the 'type' keyword
    const token14 = {
      kind: 0, range: {
        lowerBound: { line: 4, column: 5, offset: 41 },
        upperBound: { line: 4, column: 9, offset: 45 }
      }
    }
    expect(actual[14]).toEqual(token14);
    // token16 is the '$T' case
    const token16 = {
      kind: 4, range: {
        lowerBound: { line: 4, column: 15, offset: 51 },
        upperBound: { line: 4, column: 17, offset: 53 }
      }
    }
    expect(actual[16]).toEqual(token16);
    // token17 is the '::' case
    const token17 = {
      kind: 9, range: {
        lowerBound: { line: 4, column: 18, offset: 54 },
        upperBound: { line: 4, column: 20, offset: 56 }
      }
    }
    expect(actual[17]).toEqual(token17);
    // token19 is the '|'
    const token19 = {
      kind: 6, range: {
        lowerBound: { line: 4, column: 27, offset: 63 },
        upperBound: { line: 4, column: 28, offset: 64 }
      }
    }
    expect(actual[19]).toEqual(token19);

  });
});