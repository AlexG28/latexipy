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


export class Converter{
    outputString: string;
    ast: FunctionCall;

    constructor(ast: FunctionCall){
        this.outputString = "";
        this.ast = ast;
    }

    dedent(str: string): string{
        return str.split('\n').map(line => line.trimStart()).join('\n');
    }

    begin(){
        const funcName = this.ast.name;
        this.outputString += this.dedent(`
            \\begin{algorithm}
            \\caption{${funcName}}
            \\begin{algorithmic}
            \\Function{${funcName}}{}
        `);
    }

    end() {
        this.outputString += this.dedent(`
            \\EndFunction
            \\end{algorithmic}
            \\end{algorithm}
        `);
    }


    convert(): string {
        this.begin();
        this.end();
        return this.outputString;
    }
}