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
        this.outputString = "hello there";
        this.ast = ast;
    }


    convert(): string {
        return this.outputString;
    }
}