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

    // generateAssignment(assignment: Assignment): string {
    //     const varName = assignment.variable.name;
    //     const varVal = (assignment.value as NumNode).value;
    //     return this.dedent(`\\State $${varName} \\gets ${varVal}$`);
    // }


    convert(): string {
        this.begin();

        this.ast.statements.forEach(item => {
            switch(item.type){
                case "Assignment": {
                    this.outputString += (item as Assignment).toLatex + "\n"
                    break;
                }
                default: {
                    throw new Error('asdfasdf wrong');
                }
            }

        })

        this.end();
        return this.outputString;
    }
}