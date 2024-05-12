export class Token {
    type: string;
    value: string | number;

    constructor(type: string, value: string | number) {
        this.type = type;
        this.value = value;
    }
}

export class ASTNode {
    type: string;

    constructor(type: string) {
        this.type = type;
    }
}

export class BinOpNode extends ASTNode {
    left: ASTNode;
    op: Token;
    right: ASTNode;

    constructor(left: ASTNode, op: Token, right: ASTNode) {
        super('BinOp');
        this.left = left;
        this.op = op;
        this.right = right;
    }
}

export class NumNode extends ASTNode {
    value: number;

    constructor(value: number) {
        super('Num');
        this.value = value;
    }
}

export class FunctionCall extends ASTNode {
    name: string; 
    arguments: string[];
    statements: ASTNode[];

    constructor(name: string, args: string[], statements: ASTNode[]) {
        super('FunctionCall');
        this.name = name;
        this.arguments = args;
        this.statements = statements;
    }
}

export class Assignment extends ASTNode {
    variableName: string; 
    value: ASTNode; // expression

    constructor(name: string, value: ASTNode) {
        super('Assignment');
        this.variableName = name;
        this.value = value;
    }
}

export class Lexer {
    text: string;
    pos: number;
    currentChar: string | null;

    constructor(text: string) {
        this.text = text;
        this.pos = 0;
        this.currentChar = this.text[this.pos];
    }

    advance() {
        this.pos++;
        if (this.pos < this.text.length) {
            this.currentChar = this.text[this.pos];
        } else {
            this.currentChar = null;
        }
    }

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
                return new Token("NEWLINE", "");
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

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
    }

    endOfFile(): boolean {
        return this.currentToken.type == "EOF"
    }

    tokenType(): string{
        return this.currentToken.type
    }

    consumeToken(tokenType: string){
        if (this.currentToken.type === tokenType){
            this.currentToken = this.lexer.getNextToken();
        } else {
            throw new Error("Invalid Syntax");
        }
    }

    beginFunction(): FunctionCall{
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

        // function ends, statements begin

        while(!this.endOfFile()) {
            this.consumeToken("NEWLINE")
            switch(this.tokenType()) { 
                case "IF": { 
                   //statements; 
                   break; 
                }  
                case "WHILE": { 
                   //statements; 
                   break; 
                } 
                case "RETURN": { 
                   //statements; 
                   break; 
                } 
                case "ID": { 
                    //statements;    
                    statement.push(this.assignment())
                    break; 
                } 
                default: { 
                   //statements; 
                   throw new Error('Somethings wrong');
                } 
            } 
        }

        return new FunctionCall(functionName, args, statement);
    }


    assignment(): Assignment{
        let variableName: string = "";
        let value: ASTNode;

        variableName = String(this.currentToken.value);
        this.consumeToken("ID");
        
        this.consumeToken("ASSIGN");
                
        value = this.expression();

        return new Assignment(variableName, value);
    }

    expression(): ASTNode{
        let node = this.term();

        return node;
    }

    term(): ASTNode {
        let node = this.factor(); // this is the current object being worked on

        // this is where we would handle binary operators

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
            return this.assignment();
        } else {
            throw new Error("Invalid syntax")
        }
    }

}