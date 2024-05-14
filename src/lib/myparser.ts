import { 
    Token, 
    ASTNode, 
    BinOpNode, 
    FunctionCall, 
    Assignment, 
    NumNode,
    Variable,
    Return,
    IfStatement
} from "../lib/nodes";


export class Lexer {
    text: string;
    pos: number;
    currentChar: string | null;
    currentIndent: number;

    constructor(text: string) {
        this.text = text;
        this.pos = 0;
        this.currentChar = this.text[this.pos];
        this.currentIndent = 0;
    }

    advance() {
        this.pos++;
        if (this.pos < this.text.length) {
            this.currentChar = this.text[this.pos];
        } else {
            this.currentChar = null;
        }
    }


    countWhiteSpaces() {
        let counter = 0; 
        while(this.text[this.pos + counter] === ' '){
            counter += 1
        } 
        this.currentIndent = counter;
    }    

    // skipAndCountWhiteSpaces(){
    //     let counter = 0
    //     while(this.currentChar === ' '){
    //         this.advance();
    //         counter += 1;
    //     }
    //     this.currentIndent = counter;
    // }

    skipWhitespace() {
        while(this.currentChar === ' '){
            this.advance();
        }
    }

    getNextToken(): Token {
        while (this.currentChar !== null) {
            if (this.currentChar === ' ') {
                this.skipWhitespace();
                continue;
            }

            if (this.currentChar == '\n') {
                this.advance();
                this.countWhiteSpaces(); 
                return new Token("NEWLINE", "");
            }
            
            if (this.currentChar == '\t') {
                this.advance();
                return new Token("TAB", "");
            }

            if (/\d/.test(this.currentChar)) {
                let num = '';
                while (this.currentChar !== null && /\d/.test(this.currentChar)) {
                    num += this.currentChar;
                    this.advance();
                }
                return new Token('INTEGER', parseInt(num));
            }

            if (/[a-zA-Z]/.test(this.currentChar)) {
                let id = '';
                while (this.currentChar !== null && /[a-zA-Z0-9]/.test(this.currentChar)) {
                    id += this.currentChar;
                    this.advance();
                }
                if (id === 'if') {
                    return new Token('IF', id);
                } else if (id === 'then') {
                    return new Token('THEN', id);
                } else if (id === 'else') {
                    return new Token('ELSE', id);
                } else if (id === 'while'){
                    return new Token('WHILE', id);
                } else if (id == 'def') {
                    return new Token('DEF', id);
                } else if (id == 'return') {
                    return new Token('RETURN', id);
                } else {
                    return new Token('ID', id);
                }
            }

            if (this.currentChar === '+') {
                this.advance();
                return new Token('PLUS', '+');
            }

            if (this.currentChar === '-') {
                this.advance();
                return new Token('MINUS', '-');
            }

            if (this.currentChar === '*') {
                this.advance();
                return new Token('MULTIPLY', '*');
            }

            if (this.currentChar === '/') {
                this.advance();
                return new Token('DIVIDE', '/');
            }

            if (this.currentChar === '(') {
                this.advance();
                return new Token('LPAREN', '(');
            }

            if (this.currentChar === ')') {
                this.advance();
                return new Token('RPAREN', ')');
            }

            if (this.currentChar === '=') {
                this.advance();
                return new Token('ASSIGN', '=');
            }

            if (this.currentChar === '>') {
                this.advance();
                return new Token('GREATERTHAN', '>');
            }

            if (this.currentChar === '<') {
                this.advance();
                return new Token('LESSTHAN', '<');
            }

            if (this.currentChar === ':') {
                this.advance();
                return new Token('COLON', ':')
            }
            
            if (this.currentChar === ',') {
                this.advance();
                return new Token('COMMA', ',')
            }

            throw new Error('Invalid character');
        }

        return new Token('EOF', '');
    }

    updateIndent(): number{
        return Math.floor(this.currentIndent / 4);
    }

    getAllTokens(): Token[]{
        let output: Token[] = [];

        output.push(this.getNextToken())
        
        while(output[output.length-1].type !== 'EOF'){
            output.push(this.getNextToken())

        }

        return output;
    }
}

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
        
        this.consumeToken("NEWLINE") // the current indent has been updated
        
        while(!this.endOfFile() && this.currentIndentTabs >= indent) {

            switch(this.tokenType()) { 
                case "IF": { 
                   statement.push(this.ifStructure(1))
                   break; 
                }  
                case "WHILE": { 
                   //statements; 
                   break; 
                } 
                case "RETURN": { 
                   statement.push(this.return(1))
                   break; 
                } 
                case "ID": { 
                    //statements;    
                    statement.push(this.assignment(1))
                    break; 
                } 
                default: { 
                   //statements; 
                   throw new Error('Somethings wrong');
                } 
            } 
            
            if (this.newLine()){
                this.consumeToken("NEWLINE") // the current indent has been updated
            }

        }

        return new FunctionCall(functionName, 0, args, statement);
    }


    ifStructure(indent: number): IfStatement {
        let statement: ASTNode[] = [];

        this.consumeToken("IF");

        let condition = this.expression(); 
        this.consumeToken("COLON");
        this.currentIndentTabs += 1; // start of the inner 

        this.consumeToken("NEWLINE"); // when the newline token is consumed, then we check the indent level 


        while(!this.endOfFile() && this.currentIndentTabs >= indent) {
            
            switch(this.tokenType()) { 
                case "IF": { 
                   statement.push(this.ifStructure(indent + 1))
                   break; 
                }  
                case "WHILE": { 
                   //statements; 
                   break; 
                } 
                case "RETURN": { 
                   statement.push(this.return(indent + 1))
                   break; 
                } 
                case "ID": { 
                    //statements;    
                    statement.push(this.assignment(indent + 1))
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
        
        return new IfStatement(condition, 0, statement);
        
    }

    return(indent: number): Return {
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