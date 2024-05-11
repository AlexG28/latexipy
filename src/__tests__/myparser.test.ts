import { BinOpNode, ASTNode, Token, Lexer, Parser, FunctionCall, Assignment } from "$lib/myparser";

import { expect, test } from 'vitest'

test('test function declaration with no arguments', ()=> {
    const inputText = `def functionName():`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: FunctionCall = parser.beginFucntion();

    const expected: FunctionCall = new FunctionCall('functionName', []);

    expect(result).toEqual(expected);
})

test('test function declaration with one argument', ()=> {
    const inputText = `def functionName(arg1):`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: FunctionCall = parser.beginFucntion();

    const expected: FunctionCall = new FunctionCall('functionName', ["arg1"]);

    expect(result).toEqual(expected);
})

test('test function declaration with multiple arguments', ()=> {
    const inputText = `def functionName(arg1, anotherArg, arg3):`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: FunctionCall = parser.beginFucntion();

    const expected = new FunctionCall('functionName', ["arg1", "anotherArg", "arg3"]);

    expect(result).toEqual(expected);
})



test('test integer variable assignment', ()=> {
    const inputText = `varName = 14`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: Assignment = parser.assignment();

    const expected = new Assignment("varName", 14);

    expect(result).toEqual(expected);
})