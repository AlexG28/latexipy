import { 
    BinOpNode, 
    ASTNode, 
    Token, 
    NumNode, 
    FunctionCall, 
    Assignment,
    Variable,
    Return
} from "$lib/nodes";

import { Lexer, Parser } from "$lib/myparser";
import { expect, test } from 'vitest'

test('test function declaration with no arguments', ()=> {
    const inputText = `def functionName():`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: FunctionCall = parser.beginFunction();

    const expected: FunctionCall = new FunctionCall('functionName', [], []);

    expect(result).toEqual(expected);
})

test('test function declaration with one argument', ()=> {
    const inputText = `def functionName(arg1):`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: FunctionCall = parser.beginFunction();

    const expected: FunctionCall = new FunctionCall('functionName', ["arg1"], []);

    expect(result).toEqual(expected);
})

test('test function declaration with multiple arguments', ()=> {
    const inputText = `def functionName(arg1, anotherArg, arg3):`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: FunctionCall = parser.beginFunction();

    const expected = new FunctionCall('functionName', ["arg1", "anotherArg", "arg3"], []);

    expect(result).toEqual(expected);
})


test('test integer variable assignment', ()=> {
    const inputText = `varName = 14`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: Assignment = parser.assignment();

    const expected = new Assignment(new Variable("varName"), new NumNode(14));

    expect(result).toEqual(expected);
})



test('test function with an integer assignment', ()=> {
    const inputText = `def functionName(): 
    varName = 14`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: FunctionCall = parser.beginFunction();

    const expected = new FunctionCall('functionName', [], [new Assignment(new Variable("varName"), new NumNode(14))]);

    expect(result).toEqual(expected);
})

test('test function with multiple integer assignments', ()=> {
    const inputText = `def functionName(): 
    varName = 14
    anotherVar = 6969`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: FunctionCall = parser.beginFunction();

    const var1 = new Variable("varName");
    const var2 = new Variable("anotherVar");

    const expected = new FunctionCall(
        'functionName', 
        [], 
        [
            new Assignment(var1, new NumNode(14)), 
            new Assignment(var2, new NumNode(6969))
        ]
    );

    expect(result).toEqual(expected);
})


test('test expressions 1', ()=> {
    const inputText = `anotherVar = (19 + thisVar) * 4`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: Assignment = parser.assignment();

    const anotherVar = new Variable("anotherVar");
    const thisVar = new Variable("thisVar");

    const expected = new Assignment(
        anotherVar,
        new BinOpNode(
            new BinOpNode(
                new NumNode(19),
                new Token("PLUS", "+"),
                thisVar
            ), 
            new Token("MULTIPLY", "*"),
            new NumNode(4)
        )
    )

    expect(result).toEqual(expected);

})

test('test expressions 2', ()=> {
    const inputText = `anotherVar = (anotherVar / thisVar) - (233*2)`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: Assignment = parser.assignment();

    const anotherVar = new Variable("anotherVar");
    const thisVar = new Variable("thisVar");


    const expected = new Assignment(
        anotherVar,
        new BinOpNode(
            new BinOpNode(
                anotherVar,
                new Token("DIVIDE", "/"),
                thisVar
            ), 
            new Token("MINUS", "-"),
            new BinOpNode(
                new NumNode(233),
                new Token("MULTIPLY", "*"),
                new NumNode(2)
            )
        )
    )

    expect(result).toEqual(expected);
})

test('test boolean expression', ()=> {
    const inputText = `anotherVar = 19 > 4`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: Assignment = parser.assignment();

    const anotherVar = new Variable("anotherVar");

    const expected = new Assignment(
        anotherVar,
        new BinOpNode(
            new NumNode(19),
            new Token('GREATERTHAN', '>'),
            new NumNode(4),
        )
    )

    expect(result).toEqual(expected);
})


test('test function with multiple expressions', ()=> {
    const inputText = `def functionName(): 
    varName = 14 + 19
    anotherVar = 69 > 68
    lastVar = varName - anotherVar`; // this is subtracging a bool from an int but a parser doesn't care about correctness

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: FunctionCall = parser.beginFunction();

    const var1 = new Variable("varName");
    const var2 = new Variable("anotherVar");
    const var3 = new Variable("lastVar");

    const expected = new FunctionCall(
        'functionName', 
        [], 
        [
            new Assignment(
                var1, 
                new BinOpNode(
                    new NumNode(14),
                    new Token('PLUS', '+'),
                    new NumNode(19),
                )
            ), 
            new Assignment(
                var2, 
                new BinOpNode(
                    new NumNode(69),
                    new Token('GREATERTHAN', '>'),
                    new NumNode(68),
                )
            ), 
            new Assignment(
                var3, 
                new BinOpNode(
                    var1,
                    new Token('MINUS', '-'),
                    var2,
                )
            )
        ]
    );

    expect(result).toEqual(expected);
})



test('test simple return statement', ()=> {
    const inputText = `return 4`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: Return = parser.return();

    const expected = new Return(new NumNode(4));

    expect(result).toEqual(expected);
})

test('test advanced return statement', ()=> {
    const inputText = `return varName + (3/2)`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: Return = parser.return();

    const varName = new Variable("varName");

    const expected = new Return(
        new BinOpNode(
            varName,
            new Token("PLUS", "+"),
            new BinOpNode(
                new NumNode(3),
                new Token("DIVIDE", "/"),
                new NumNode(2)
            ), 
        ), 
    );

    expect(result).toEqual(expected);
})
