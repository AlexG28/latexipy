import { 
    BinOpNode,  
    Token, 
    NumNode, 
    FunctionCall, 
    Assignment,
    Variable,
    Return, 
    IfStatement,
    WhileStatement,
    ExternalFunction,
    ForLoop
} from "$lib/nodes";

import { expect, test } from 'vitest'


const dedent = (str: string): string => {
    return str.split('\n').map(line => line.trimStart()).join('\n');
}


test('create an empty function with no arguments', ()=> {
    const ast = new FunctionCall('functionName', [], []);
    const result = ast.toLatex();

    const expected = dedent(
        `\\Function{functionName}{}

        \\EndFunction`);

    expect(result).toEqual(expected);
})


test('create an empty function with multiple arguments', ()=> {
    const ast = new FunctionCall('functionName', ["k", "arr1", "arr2"], []);
    const result = ast.toLatex();

    const expected = dedent(
        `\\Function{functionName}{k,arr1,arr2}

        \\EndFunction`);

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
    const ifNode = new IfStatement(
        new BinOpNode(
            new NumNode(2),
            new Token("GREATERTHAN", ">"),
            new NumNode(1),
        ), 
        [],
        [],
        []
    )
    const result = ifNode.toLatex();

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
    
    const ifStatement = new IfStatement(
        condition, 
        [],
        [], 
        []
    )
    const result = ifStatement.toLatex();

    const expected = dedent(`
        \\If{$(sum / 4) * (2 + 3)$}



        \\EndIf`);
    expect(result).toEqual(expected);
})


test('if elif else statements', ()=> {
    const condition1 = new BinOpNode(
        new Variable("sum"),
        new Token("GREATERTHAN", ">"),
        new NumNode(4)
    )
    const condition2 = new BinOpNode(
        new Variable("num"),
        new Token("GREATERTHAN", ">"),
        new Variable("sum"),
    )
    
    const statement1 = new Assignment(
        new Variable("num"),
        new NumNode(19)
    )
    const statement2 = new Assignment(
        new Variable("sum"),
        new NumNode(16)
    )

    const returnNode = new IfStatement(
        condition1, 
        [statement1],
        [
            {
                condition: condition2,
                statements: [statement1, statement2]
            },
            {
                condition: condition1,
                statements: [statement2, statement1]
            }
        ], 
        [statement2, statement1, statement2]
    )
    const result = returnNode.toLatex();

    const expected = dedent(`
    \\If{$sum > 4$}
    \\State $num \\gets 19$
    
    \\ElsIf{$num > sum$}
    \\State $num \\gets 19$
    \\State $sum \\gets 16$
    
    \\ElsIf{$sum > 4$}
    \\State $sum \\gets 16$
    \\State $num \\gets 19$
    
    
    \\Else
    \\State $sum \\gets 16$
    \\State $num \\gets 19$
    \\State $sum \\gets 16$
    
    \\EndIf`);
    expect(result).toEqual(expected);
})

test('nested if else statements', ()=> {
    const condition = new BinOpNode(
        new Variable("sum"),
        new Token("GREATERTHAN", ">"),
        new NumNode(4)
    )
    const statement = new Assignment(
        new Variable("num"),
        new NumNode(19)
    )

    const returnNode = new IfStatement(
        condition, 
        [],
        [
            {
                condition: condition,
                statements: [new IfStatement(
                    condition,
                    [statement],
                    [],
                    [statement]
                )]
            }
        ], 
        []
    )
    const result = returnNode.toLatex();

    const expected = dedent(`
    \\If{$sum > 4$}

    \\ElsIf{$sum > 4$}

    \\If{$sum > 4$}
    \\State $num \\gets 19$


    \\Else
    \\State $num \\gets 19$

    \\EndIf



    \\EndIf`);
    expect(result).toEqual(expected);
})


test('while statement with complex condition', ()=> {
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
    
    const whileStatement = new WhileStatement(
        condition, 
        []
    )
    const result = whileStatement.toLatex();

    const expected = dedent(`
        \\While{$(sum / 4) * (2 + 3)$}

        \\EndWhile`);

    expect(result).toEqual(expected);
})


test('external function call', ()=> {
    
    const externalFunction = new ExternalFunction(
        "max",
        ["num1", "num2"]
    )

    const result = externalFunction.toLatex();

    const expected = dedent(`\\Call{max}{num1,num2}`);
    expect(result).toEqual(expected);
})


test('test for loop with range with start and end', ()=> {
    
    const externalFunction = new ExternalFunction(
        "range",
        ["start", "end"]
    )

    const forloop = new ForLoop(
        new Variable("i"), 
        externalFunction, 
        []
    )

    const result = forloop.toLatex();

    const expected = dedent(`
    \\For{$i = start, \\dots, end$}

    \\EndFor`);
    expect(result).toEqual(expected);
})

test('test for loop with range with end', ()=> {
    
    const externalFunction = new ExternalFunction(
        "range",
        ["end"]
    )

    const forloop = new ForLoop(
        new Variable("i"), 
        externalFunction, 
        []
    )

    const result = forloop.toLatex();

    const expected = dedent(`
    \\For{$i = 0, \\dots, end$}

    \\EndFor`);
    expect(result).toEqual(expected);
})

test('test for loop with object', ()=> {
    const forloop = new ForLoop(
        new Variable("car"), 
        new Variable("cars"), 
        []
    )

    const result = forloop.toLatex();

    console.log(result)

    const expected = dedent(`
    \\For{$car$ in $cars$}

    \\EndFor`);
    expect(result).toEqual(expected);
})
