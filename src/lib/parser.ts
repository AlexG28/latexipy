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

import { Lexer } from "$lib/lexer";

export class Parser{
    lexer: Lexer;
    currentToken: Token;
    currentIndentTabs: number; 

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
        this.currentIndentTabs = 0;
    }

    endOfFile(): boolean {
        return this.currentToken.type == "EOF"
    }

    newLine(): boolean {
        return this.currentToken.type == "NEWLINE"
    }

    tokenType(): string{
        return this.currentToken.type
    }

    consumeToken(tokenType: string){
        if (this.currentToken.type === tokenType){
            this.currentToken = this.lexer.getNextToken();
            
            if (tokenType == "NEWLINE") {
                this.currentIndentTabs = this.lexer.updateIndent();
            }
            
        } else {
            throw new Error("Invalid Syntax");
        }
    }

    beginFunction(indent: number): FunctionCall{
        let args: string[] = [];
        let functionName: string = "";
        let statement: ASTNode[] = [];

        this.consumeToken("DEF")
        functionName = String(this.currentToken.value);
        this.consumeToken("ID")
        this.consumeToken("LPAREN")

        if (this.currentToken.type != "RPAREN"){
            for (;;){
                args.push(String(this.currentToken.value));
                this.consumeToken("ID")
                
                if (this.currentToken.type == "COMMA"){
                    this.consumeToken("COMMA")
                } else if (this.currentToken.type == "RPAREN") {
                    break;
                }
            }
        }

        this.consumeToken("RPAREN")
        this.consumeToken("COLON")

        this.consumeToken("NEWLINE")

        statement = this.collectStatements(indent);

        return new FunctionCall(functionName, args, statement);
    }


    ifStructure(indent: number): IfStatement {
        let statement: ASTNode[] = [];
        let elseStatements: ASTNode[] = []
        
        this.consumeToken("IF");

        let condition = this.expression(); 
        
        this.consumeToken("COLON");
        this.consumeToken("NEWLINE");

        statement = this.collectStatements(indent);
    


        if (this.currentToken.type == "ELSE"){
            this.consumeToken("ELSE")
            this.consumeToken("COLON")
            this.consumeToken("NEWLINE")
            elseStatements = this.collectStatements(indent);
        }

        return new IfStatement(condition, statement, elseStatements);
    }

    whileStructure(indent: number): WhileStatement{
        let statement: ASTNode[] = [];

        this.consumeToken("WHILE");

        let condition = this.expression(); 
        
        this.consumeToken("COLON");
        this.consumeToken("NEWLINE");

        statement = this.collectStatements(indent);
        
        return new WhileStatement(condition, statement);
    }

    collectStatements(indent: number): ASTNode[] {
        let statement: ASTNode[] = [];
        
        while(!this.endOfFile() && this.currentIndentTabs > indent) {
            
            switch(this.tokenType()) { 
                case "IF": { 
                   statement.push(this.ifStructure(indent + 1));
                   break; 
                }  
                case "WHILE": { 
                   //statements; 
                   statement.push(this.whileStructure(indent + 1));
                   break; 
                } 
                case "RETURN": { 
                   statement.push(this.return())
                   break; 
                } 
                case "ID": { 
                    //statements;    
                    statement.push(this.assignment(indent + 1));
                    break; 
                } 
                default: { 
                   //statements; 
                   throw new Error('Somethings wrong');
                } 
            }
            
            if (this.newLine()){
                this.consumeToken("NEWLINE");
            }
            
        }

        return statement;
    }

    return(): Return {
        let value: ASTNode;
        
        this.consumeToken("RETURN");
        value = this.expression();

        return new Return(value);
    }

    assignment(indent: number): Assignment{
        let variable: Variable;
        let value: ASTNode;

        variable = new Variable(String(this.currentToken.value));
        this.consumeToken("ID");
        
        this.consumeToken("ASSIGN");
                
        value = this.expression();

        return new Assignment(variable, value);
    }

    expression(): ASTNode{
        let node = this.term();

        return node;
    }

    term(): ASTNode {
        let node = this.factor();

        while ([
            'MULTIPLY', 
            'DIVIDE', 
            'PLUS', 
            'MINUS', 
            'GREATERTHAN', 
            'LESSTHAN'
        ].includes(this.currentToken.type)) {
            const token = this.currentToken;
            this.consumeToken(this.currentToken.type);
            node = new BinOpNode(node, token, this.factor());
        }

        return node;
    }

    factor() {
        const currentToken = this.currentToken;

        if (currentToken.type == "INTEGER"){
            const returnVal = new NumNode(Number(currentToken.value))
            this.consumeToken("INTEGER");
            return returnVal;
        } else if (currentToken.type == "LPAREN") {
            this.consumeToken("LPAREN");
            const result = this.expression();
            this.consumeToken("RPAREN");
            return result;
        } else if (currentToken.type == "ID") {
            const variableName = String(currentToken.value);
            this.consumeToken("ID");
            return new Variable(variableName)
        } else {
            throw new Error("Invalid syntax")
        }
    }
}