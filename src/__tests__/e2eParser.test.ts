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

import { Parser } from "$lib/parser";
import { Lexer } from "$lib/lexer";
import { expect, test } from 'vitest'

test('test tab counting', ()=> {
    const inputText = 
`def func1(): 
    if 2>1:
        b=1
    c=2
    d=3
`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result = parser.beginFunction(0);

    const expected = new FunctionCall(
        'func1', 
        [], 
        [
            new IfStatement(
                new BinOpNode(
                    new NumNode(2),
                    new Token("GREATERTHAN", ">"),
                    new NumNode(1),
                ), 
                [
                    new Assignment(
                        new Variable("b"), 
                        "ASSIGN", 
                        new NumNode(1)
                    )
                ], 
                [],
                []
            ),
            new Assignment(new Variable("c"), "ASSIGN", new NumNode(2)),
            new Assignment(new Variable("d"), "ASSIGN", new NumNode(3)),
        ]
    );
    expect(result).toEqual(expected);
})

test('test nested tab counting', ()=> {
    const inputText = 
`def func1(): 
    if 2>1:
        if 3>2: 
            d=4
        f=42
    c=2
`;

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result = parser.beginFunction(0);

    const innerIfStatement = new IfStatement(
        new BinOpNode(
            new NumNode(3),
            new Token("GREATERTHAN", ">"),
            new NumNode(2),
        ), 
        [
            new Assignment(
                new Variable("d"), 
                "ASSIGN", 
                new NumNode(4)
            )
        ], 
        [],
        []
    );

    const outerIfStatement = new IfStatement(
        new BinOpNode(
            new NumNode(2),
            new Token("GREATERTHAN", ">"),
            new NumNode(1),
        ), 
        [
            innerIfStatement, 
            new Assignment(new Variable("f"), "ASSIGN", new NumNode(42)),
        ],
        [],
        []
    )

    const expected = new FunctionCall(
        'func1', 
        [], 
        [
            outerIfStatement,
            new Assignment(new Variable("c"), "ASSIGN", new NumNode(2)),
        ]
    );
    expect(result).toEqual(expected);
})


test('end to end test', ()=> {
    const inputText = 
`def functionName(): 
    varName = 14 + 19
    anotherVar = 69 > 68
    if anotherVar:
        while lastVar > 2:
            lastVar = varName - anotherVar
    else: 
        lastVar = 19
    return varName`; 

    const lexer = new Lexer(inputText);
    const parser = new Parser(lexer);
    const result: FunctionCall = parser.beginFunction(0);

    const var1 = new Variable("varName");
    const var2 = new Variable("anotherVar");
    const var3 = new Variable("lastVar");

    const firstAssignment = new Assignment(
        var1, 
        "ASSIGN", 
        new BinOpNode(
            new NumNode(14),
            new Token('PLUS', '+'),
            new NumNode(19),
        )
    );

    const secondAssignment = new Assignment(
        var2, 
        "ASSIGN", 
        new BinOpNode(
            new NumNode(69),
            new Token('GREATERTHAN', '>'),
            new NumNode(68),
        )
    );

    const thirdAssignment = new Assignment(
        var3,
        "ASSIGN", 
        new BinOpNode(
            var1,
            new Token('MINUS', '-'),
            var2
        )
    );
    
    const fourthAssignment = new Assignment(
        var3,
        "ASSIGN", 
        new NumNode(19)
    );
    
    const whileStatement = new WhileStatement(
        new BinOpNode(
            var3,
            new Token('GREATERTHAN', '>'),
            new NumNode(2)
        ), 
        [thirdAssignment]
    );


    const expected = new FunctionCall(
        'functionName', 
        [], 
        [
            firstAssignment, 
            secondAssignment, 
            new IfStatement(
                var2,
                [
                    whileStatement
                ], 
                [],
                [fourthAssignment]
            ),
            new Return(var1)
        ]
    );

    expect(result).toEqual(expected);
})