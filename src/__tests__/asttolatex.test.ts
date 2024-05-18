import { 
    BinOpNode, 
    ASTNode, 
    Token, 
    NumNode, 
    FunctionCall, 
    Assignment,
    Variable,
    Return, 
    IfStatement,
    WhileStatement
} from "$lib/nodes";

import { expect, test } from 'vitest'
import { Converter } from "$lib/asttolatex";


const dedent = (str: string): string => {
    return str.split('\n').map(line => line.trimStart()).join('\n');
}


test('create an empty function ', ()=> {
    const ast = new FunctionCall('functionName', [], []);
    const conv = new Converter(ast);

    const result = conv.convert();

    const expected = dedent(`
        \\begin{algorithm}
        \\caption{functionName}
        \\begin{algorithmic}
        \\Function{functionName}{}

        \\EndFunction
        \\end{algorithmic}
        \\end{algorithm}
    `);

    expect(result).toEqual(expected);
})
