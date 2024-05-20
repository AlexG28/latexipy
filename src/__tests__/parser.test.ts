import { 
    BinOpNode,  
    Token, 
    NumNode, 
    FunctionCall, 
    Assignment,
    Variable,
    Return, 
    IfStatement,
    WhileStatement
} from "$lib/nodes";

import { Parser } from "$lib/parser";
import { Lexer } from "$lib/lexer";
import { expect, test } from 'vitest'
import type { elifCondStatement } from "$lib/nodes"

test('test function declaration with no arguments', ()=> {
    const inputText = `def functionName():
    `;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: FunctionCall = parser.beginFunction(0);

    const expected: FunctionCall = new FunctionCall('functionName', [], []);

    expect(result).toEqual(expected);
})


test('test function declaration with one argument', ()=> {
    const inputText = `def functionName(arg1):
    `;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: FunctionCall = parser.beginFunction(0);

    const expected: FunctionCall = new FunctionCall('functionName', ["arg1"], []);

    expect(result).toEqual(expected);
})


test('test function declaration with multiple arguments', ()=> {
    const inputText = `def functionName(arg1, anotherArg, arg3):
    `;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: FunctionCall = parser.beginFunction(0);

    const expected = new FunctionCall('functionName', ["arg1", "anotherArg", "arg3"], []);

    expect(result).toEqual(expected);
})


test('test integer variable assignment', ()=> {
    const inputText = `varName = 14`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: Assignment = parser.assignment(0);

    const expected = new Assignment(new Variable("varName"), new NumNode(14));

    expect(result).toEqual(expected);
})


test('test function with an integer assignment', ()=> {
    const inputText = 
        `def functionName(): 
            varName = 14`;  

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: FunctionCall = parser.beginFunction(0);

    const expected = new FunctionCall('functionName', [], [new Assignment(new Variable("varName"), new NumNode(14))]);

    expect(result).toEqual(expected);
})


test('test function with multiple integer assignments', ()=> {
    const inputText = 
        `def functionName(): 
            varName = 14
            anotherVar = 6969`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: FunctionCall = parser.beginFunction(0);

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
    const result: Assignment = parser.assignment(0);

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
    const result: Assignment = parser.assignment(0);

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
    const result: Assignment = parser.assignment(0);

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


test('test if statement', ()=> {
    const inputText = `if 10 > 4:
    `;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result = parser.ifStructure(0);

    const expected = new IfStatement(
        new BinOpNode(
            new NumNode(10),
            new Token("GREATERTHAN", ">"),
            new NumNode(4)
        ), 
        [],
        [],
        []
    )

    expect(result).toEqual(expected);
})


test('test if else condition', ()=> {
    const inputText = 
`if 10 > 4:
    a=1
else:
    a=2
`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result = parser.ifStructure(0);

    const expected = new IfStatement(
        new BinOpNode(
            new NumNode(10),
            new Token("GREATERTHAN", ">"),
            new NumNode(4)
        ), 
        [
            new Assignment(
                new Variable("a"),
                new NumNode(1)
            )
        ],
        [],
        [
            new Assignment(
                new Variable("a"),
                new NumNode(2)
            )
        ]
    )

    expect(result).toEqual(expected);
})


test('test if elif condition', ()=> {
    const inputText = 
`if 10 > 4:
    a=1
elif 3>2:
    b=2
    c=3
`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result = parser.ifStructure(0);

    const expected = new IfStatement(
        new BinOpNode(
            new NumNode(10),
            new Token("GREATERTHAN", ">"),
            new NumNode(4)
        ), 
        [
            new Assignment(
                new Variable("a"),
                new NumNode(1)
            )
        ],
        [
            {
                condition: new BinOpNode(
                    new NumNode(3),
                    new Token("GREATERTHAN", ">"),
                    new NumNode(2)
                ),
                statements: [
                    new Assignment(
                        new Variable("b"),
                        new NumNode(2)
                    ),
                    new Assignment(
                        new Variable("c"),
                        new NumNode(3)
                    )
                ]
            }
        ],
        []
    )

    expect(result).toEqual(expected);
})


test('test if elif else condition', ()=> {
    const inputText = 
`if 10 > 4:
    a=1
elif 3>2:
    b=2
    c=3
elif var1<var2:
    g=19
else: 
    d=4
`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result = parser.ifStructure(0);

    const expected = new IfStatement(
        new BinOpNode(
            new NumNode(10),
            new Token("GREATERTHAN", ">"),
            new NumNode(4)
        ), 
        [
            new Assignment(
                new Variable("a"),
                new NumNode(1)
            )
        ],
        [
            {
                condition: new BinOpNode(
                    new NumNode(3),
                    new Token("GREATERTHAN", ">"),
                    new NumNode(2)
                ),
                statements: [
                    new Assignment(
                        new Variable("b"),
                        new NumNode(2)
                    ),
                    new Assignment(
                        new Variable("c"),
                        new NumNode(3)
                    )
                ]
            },
            {
                condition: new BinOpNode(
                    new Variable("var1"),
                    new Token("LESSTHAN", "<"),
                    new Variable("var2"),
                ),
                statements: [
                    new Assignment(
                        new Variable("g"),
                        new NumNode(19)
                    ),
                ]
            }
        ],
        [
            new Assignment(
                new Variable("d"),
                new NumNode(4)
            )
        ]
    )

    expect(result).toEqual(expected);
})


test('test while statement', ()=> {
    const inputText = `while 10 > 4:
    `;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result = parser.whileStructure(0);

    const expected = new WhileStatement(
        new BinOpNode(
            new NumNode(10),
            new Token("GREATERTHAN", ">"),
            new NumNode(4)
        ), 
        []
    )

    expect(result).toEqual(expected);
})
