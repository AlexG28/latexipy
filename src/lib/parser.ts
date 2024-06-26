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
    WhileStatement, 
    ForLoop,
    ExternalFunction,
    List,
    StringNode,
    Slice, 
    KeyValue,
    Dict
} from "./nodes";

import { Lexer } from "$lib/lexer";
import { type elifCondStatement } from "./nodes"

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

    tokenValue(): string | number{
        return this.currentToken.value;
    }

    consumeToken(tokenType: string){
        if (this.currentToken.type === tokenType){
            this.currentToken = this.lexer.getNextToken();
            
            if (tokenType == "NEWLINE") {
                this.currentIndentTabs = this.lexer.updateIndent();
            }
            
        } else {
            throw new Error(`Unexpected token "${this.currentToken.value}" instead of ${tokenType} on line ${this.lexer.getLineNumber()}`);
        }
    }

    consumeAssign() {
        const assignmentTokens = ["ASSIGN", "ADDASSIGN", "SUBTRACTASSIGN"]

        if (assignmentTokens.includes(this.currentToken.type)){
            this.currentToken = this.lexer.getNextToken();
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
        let elifcondstatements: elifCondStatement[] = [];
        let elseStatements: ASTNode[] = []
        
        this.consumeToken("IF");

        let condition = this.expression(); 
        
        this.consumeToken("COLON");
        this.consumeToken("NEWLINE");

        statement = this.collectStatements(indent);
    

        while(this.currentToken.type == "ELIF") {
            this.consumeToken("ELIF")
            
            let newCond = this.expression();

            this.consumeToken("COLON")
            this.consumeToken("NEWLINE")

            let newStatements = this.collectStatements(indent);

            let newcondstatement: elifCondStatement = {
                condition: newCond,
                statements: newStatements
            }

            elifcondstatements.push(newcondstatement);
        }


        if (this.currentToken.type == "ELSE"){
            this.consumeToken("ELSE")
            this.consumeToken("COLON")
            this.consumeToken("NEWLINE")
            elseStatements = this.collectStatements(indent);
        }

        return new IfStatement(condition, statement, elifcondstatements, elseStatements);
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

    forStructure(indent: number): ForLoop{
        let statements: ASTNode[] = [];
        let index = "";
        
        this.consumeToken("FOR");
        index = String(this.currentToken.value);
        this.consumeToken("ID");
    
        this.consumeToken("IN");

        let func = this.variableOrFunction();
        this.consumeToken("COLON");
        this.consumeToken("NEWLINE");

        statements = this.collectStatements(indent);

        return new ForLoop(
            new Variable(index, null), 
            func, 
            statements
        )
    }

    processList(): List {
        let elements: ASTNode[] = [];
        
        this.consumeToken("LEFTBRACKET")
        if (this.tokenType() != "RIGHTBRACKET"){
            for (;;) {
                elements.push(this.expression())

                if (this.tokenType() == "COMMA"){
                    this.consumeToken("COMMA")
                } else if (this.tokenType() == "RIGHTBRACKET"){
                    break;
                }
            }
        }

        this.consumeToken("RIGHTBRACKET")
        
        return new List(elements)
    }
    
    processDict(): Dict {
        let elements: KeyValue[] = [];
        
        this.consumeToken("LEFTBRACE")
        if (this.tokenType() != "RIGHTBRACE"){
            for (;;) {
                
                let key = this.expression();
                this.consumeToken("COLON")
                let value = this.expression();

                const keyValue = new KeyValue(key, value);

                elements.push(keyValue);

                if (this.tokenType() == "COMMA"){
                    this.consumeToken("COMMA")
                } else if (this.tokenType() == "RIGHTBRACE"){
                    break;
                }
            }
        }

        this.consumeToken("RIGHTBRACE")
        
        return new Dict(elements)
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
                   statement.push(this.whileStructure(indent + 1));
                   break; 
                } 
                case "FOR": {
                    statement.push(this.forStructure(indent + 1))
                    break;
                }
                case "RETURN": { 
                   statement.push(this.return())
                   break; 
                } 
                case "ID": { 
                    statement.push(this.assignmentOrFunction());
                    break; 
                } 
                case "NEWLINE": {
                    this.consumeToken("NEWLINE")
                    break;
                }
                default: { 
                   throw new Error(`Invalid statement keyword ${this.tokenValue()} on line ${this.lexer.getLineNumber()}`);
                } 
            }
        }

        return statement;
    }


    assignmentOrFunction(): Assignment | ExternalFunction {
        const variableName = String(this.currentToken.value);
        this.consumeToken("ID");

        if (this.tokenType() == "LPAREN"){
            return this.functionArguments(variableName);
        } else {
            return this.assignment(variableName);
        }
    }

    return(): Return {
        let value: ASTNode;
        
        this.consumeToken("RETURN");
        value = this.expression();

        return new Return(value);
    }


    assignment(variableName: string): Assignment{
        let variable: Variable;
        let value: ASTNode;
        let operatorType: string;

        variable = this.processVariableSlice(variableName);

        operatorType = this.tokenType();
        
        this.consumeAssign();
                
        value = this.expression();

        return new Assignment(variable, operatorType, value);
    }

    functionArguments(name: string): ExternalFunction{
        let args: ASTNode[] = [];
        this.consumeToken("LPAREN")
        if (this.tokenType() != "RPAREN"){
            for (;;){
                args.push(this.expression())
                
                if (this.tokenType() == "COMMA"){
                    this.consumeToken("COMMA")
                } else if (this.tokenType() == "RPAREN") {
                    break;
                }
            }
        }
        this.consumeToken("RPAREN")
        return new ExternalFunction(name, args);
    }

    processVariableSlice(name: string): Variable {
        if (this.tokenType() == "LEFTBRACKET"){
            this.consumeToken("LEFTBRACKET");
            
            const parseElement = (): ASTNode | null => {
                if (!["COLON", "RIGHTBRACKET"].includes(this.tokenType())){
                    return this.factor();
                } 
                return null;
            }

            let elems: (ASTNode | null) [] = [null, null, null];
            for(let i = 0; i < 3; i++){
                elems[i] = parseElement();
                if (this.tokenType() == "COLON")
                {
                    this.consumeToken("COLON")
                } 
            }
            this.consumeToken("RIGHTBRACKET")

            const slice = new Slice(elems[0], elems[1], elems[2])
            return new Variable(name, slice)
        } 

        return new Variable(name, null);
    }

    variableOrFunction(): Variable | ExternalFunction{
        const name = String(this.currentToken.value);
        this.consumeToken("ID");
        
        if (this.tokenType() == "LPAREN"){
            return this.functionArguments(name);
        } else {
            return this.processVariableSlice(name);
        }
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
            'LESSTHAN',
            'GREATERTHANOREQUAL', 
            'LESSTHANOREQUAL',
            'EQUAL',
            'IN'
        ].includes(this.currentToken.type)) {
            const token = this.currentToken;
            this.consumeToken(this.currentToken.type);
            node = new BinOpNode(node, token, this.factor());
        }

        return node;
    }

    factor() {
        switch(this.currentToken.type) {
            case "INTEGER": {
                const returnVal = new NumNode(Number(this.currentToken.value))
                this.consumeToken("INTEGER");
                return returnVal;
            }
            case "STRING": {
                const returnVal = new StringNode(String(this.currentToken.value));
                this.consumeToken("STRING");
                return returnVal;
            }
            case "FLOAT": {
                const returnVal = new NumNode(Number(this.currentToken.value))
                this.consumeToken("FLOAT");
                return returnVal;
            }
            case "LPAREN": {
                this.consumeToken("LPAREN");
                const result = this.expression();
                this.consumeToken("RPAREN");
                return result;
            }
            case "ID": {
                return this.variableOrFunction();
            }
            case "MINUS": {
                this.consumeToken("MINUS")
                const returnVal = new NumNode(-1 * Number(this.currentToken.value))
                this.consumeToken("INTEGER");
                return returnVal;
            }
            case "LEFTBRACKET": {
                return this.processList();
            }
            case "LEFTBRACE": {
                return this.processDict();
            }
            default: {
                throw new Error(`Invalid character in expression ${this.currentToken.value} on line ${this.lexer.getLineNumber()}`);
            }
        }
    }
}