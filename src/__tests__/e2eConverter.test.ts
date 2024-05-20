import { ASTToLatex } from "$lib/asttolatex";
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

import { expect, test } from 'vitest'


const dedent = (str: string): string => {
    return str.split('\n').map(line => line.trimStart()).join('\n');
}


test('General test', ()=> {
    const ifNode = new IfStatement(
        new BinOpNode(
            new Variable("sum"),
            new Token("GREATERTHAN", ">"),
            new NumNode(420),
        ), 
        [
            new Assignment(
                new Variable("dividend"),
                new NumNode(0)
            )
        ], 
        [],
        []
    )
    
    
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

    const returnNode = new Return(
        new Variable("dividend")
    )
    
    const whileStatement = new WhileStatement(
        condition, 
        [assignemnt]
    )
    
    const ast = new FunctionCall(
        'calculateDividendFromSum', 
        ["sum"], 
        [ifNode, whileStatement, returnNode]
    );
    
    const converter = new ASTToLatex(ast);
    const result = converter.convert();

    const expected = dedent(
        `\\begin{algorithm}
        \\caption{calculateDividendFromSum}
        \\begin{algorithmic}
        \\Function{calculateDividendFromSum}{sum}

        \\If{$sum > 420$}
        \\State $dividend \\gets 0$
        


        \\EndIf
        
        \\While{$(sum / 4) * (2 + 3)$}
        \\State $dividend \\gets (sum / 4) * (2 + 3)$
        
        \\EndWhile
        \\State \\Return dividend
        
        \\EndFunction
        \\end{algorithmic}
        \\end{algorithm}`);

    expect(result).toEqual(expected);
})
