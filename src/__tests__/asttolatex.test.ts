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
import { ASTToLatex } from "$lib/asttolatex";


const dedent = (str: string): string => {
    return str.split('\n').map(line => line.trimStart()).join('\n');
}


test('create an empty function ', ()=> {
    const ast = new FunctionCall('functionName', [], []);
    const conv = new ASTToLatex(ast);

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


test('simple binary op with numbers', ()=> {
    const binop = new BinOpNode(
        new NumNode(42),
        new Token("PLUS", "+"),
        new NumNode(93)
    )
    const result = binop.toLatex();

    const expected = `42 + 93`;
    expect(result).toEqual(expected);
})

test('simple binary op with numbers and variables', ()=> {
    const binop = new BinOpNode(
        new Variable("accumulator"),
        new Token("MULTIPLY", "*"),
        new NumNode(2)
    )
    const result = binop.toLatex();

    const expected = `accumulator * 2`;
    expect(result).toEqual(expected);
})


test('nested binary op', ()=> {
    const binop = new BinOpNode(
        new BinOpNode(
            new Variable("sum"),
            new Token("DIVIDE", "/"),
            new NumNode(4)
        ),
        new Token("MULTIPLY", "*"),
        new BinOpNode(
            new NumNode(2),
            new Token("PLUS", "+"),
            new NumNode(3)
        )
    )
    const result = binop.toLatex();

    const expected = `(sum / 4) * (2 + 3)`;
    expect(result).toEqual(expected);
})


test('simple integer assignment', ()=> {
    const assignemnt = new Assignment(
        new Variable("a"),
        new NumNode(19)
    )
    const result = assignemnt.toLatex();

    const expected = `\\State $a \\gets 19$`;
    expect(result).toEqual(expected);
})


test('variable assignment with an expression', ()=> {
    const binop = new BinOpNode(
        new BinOpNode(
            new Variable("sum"),
            new Token("DIVIDE", "/"),
            new NumNode(4)
        ),
        new Token("MULTIPLY", "*"),
        new BinOpNode(
            new NumNode(2),
            new Token("PLUS", "+"),
            new NumNode(3)
        )
    )
    
    const assignemnt = new Assignment(
        new Variable("dividend"),
        binop
    )
    
    const result = assignemnt.toLatex();
    
    const expected = `\\State $dividend \\gets (sum / 4) * (2 + 3)$`;
    expect(result).toEqual(expected);
})

test('simple return', ()=> {
    const returnNode = new Return(
        new Variable("dividend")
    )
    const result = returnNode.toLatex();

    const expected = `\\State \\Return dividend`;
    expect(result).toEqual(expected);
})


test('simple if statement', ()=> {
    const returnNode = new IfStatement(
        new BinOpNode(
            new NumNode(2),
            new Token("GREATERTHAN", ">"),
            new NumNode(1),
        ), 
        []
    )
    const result = returnNode.toLatex();

    const expected = dedent(`
        \\If{$2 > 1$}

        \\EndIf`);
    expect(result).toEqual(expected);
})


test('if statement with complex condition', ()=> {
    const condition = new BinOpNode(
        new BinOpNode(
            new Variable("sum"),
            new Token("DIVIDE", "/"),
            new NumNode(4)
        ),
        new Token("MULTIPLY", "*"),
        new BinOpNode(
            new NumNode(2),
            new Token("PLUS", "+"),
            new NumNode(3)
        )
    )
    
    const returnNode = new IfStatement(
        condition, 
        []
    )
    const result = returnNode.toLatex();

    const expected = dedent(`
        \\If{$(sum / 4) * (2 + 3)$}

        \\EndIf`);
    expect(result).toEqual(expected);
})
