import { Lexer } from "$lib/lexer";
import { Parser } from "$lib/parser";
import { ASTToLatex } from "$lib/asttolatex"; 

import { expect, test } from 'vitest';

const dedent = (str: string): string => {
    return str.split('\n').map(line => line.trimStart()).join('\n');
}


test('global system test', ()=> {
    const input_text = 
`def increaseDividend(): 
    dividend=28`;
   
    const lexer = new Lexer(input_text);
    const parser = new Parser(lexer);
    const ast = parser.beginFunction(0);

    const converter = new ASTToLatex(ast);
    const result = converter.convert();

    const expected = dedent(
        `\\begin{algorithm}
        \\caption{increaseDividend}
        \\begin{algorithmic}
        \\Function{increaseDividend}{}
        \\State $dividend \\gets 28$
        \\EndFunction
        \\end{algorithmic}
        \\end{algorithm}`);

    expect(result).toEqual(expected);
})

