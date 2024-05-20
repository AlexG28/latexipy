import { 
    Token, 
    ASTNode, 
    BinOpNode, 
    FunctionCall, 
    Assignment, 
    NumNode,
    Variable,
    Return,
    IfStatement,
    WhileStatement
} from "./nodes";


export class ASTToLatex{
    ast: FunctionCall;

    constructor(ast: FunctionCall){
        this.ast = ast;
    }

    dedent(str: string): string{
        return str.split('\n').map(line => line.trimStart()).join('\n');
    }

    convert(): string{
        let astLatex = this.ast.toLatex(); 
        let functionName = this.ast.name;
        
        return this.dedent(
        `\\begin{algorithm}
        \\caption{${functionName}}
        \\begin{algorithmic}
        ${astLatex}
        \\end{algorithmic}
        \\end{algorithm}`);
    }
}