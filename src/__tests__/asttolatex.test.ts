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


test('test function declaration with no arguments', ()=> {
    const ast = new FunctionCall('functionName', [], []);
    const conv = new Converter(ast);

    const result = conv.convert();

    expect(result).toEqual("hello there");
})