import { Lexer, Parser } from '../lib/parser2';

import { expect, test } from 'vitest'




test('parser 2', ()=> { 
    const input = `a = 14 + 19`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const result = parser.expr();

    console.log(result)
    
})



// test('testing while', ()=> { 
//     const input = `if 10 > 4 then a = 14 endif`;
//     const lexer = new Lexer(input);
//     const parser = new Parser(lexer);
//     const result = parser.expr();

//     console.log(result)
    
// })