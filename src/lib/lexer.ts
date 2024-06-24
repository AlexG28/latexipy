import { Token } from "../lib/nodes";


export class Lexer {
    text: string;
    pos: number;
    currentChar: string | null;
    currentIndent: number;
    lineNumber: number;

    constructor(text: string) {
        this.text = this.removeEmptyLines(text);
        this.pos = 0;
        this.currentChar = this.text[this.pos];
        this.currentIndent = 0;
        this.lineNumber = 0;
    }

    removeEmptyLines(text: string){
        return text.split('\n').filter(line => line.trim() !== '').join('\n')
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

    skipWhitespace() {
        while(this.currentChar === ' '){
            this.advance();
        }
    }

    getNextToken(): Token {
        const operatorChars = "+-*/%<>=";
        while (this.currentChar !== null) {
            if (this.currentChar === ' ') {
                this.skipWhitespace();
                continue;
            }

            if (this.currentChar == '\n') {
                this.advance();
                this.countWhiteSpaces(); 
                this.lineNumber += 1;
                return new Token("NEWLINE", "");
            }
            
            if (this.currentChar == '\t') {
                this.advance();
                return new Token("TAB", "");
            }

            if (/\d/.test(this.currentChar) || this.currentChar === '.') {
                let accum = '';
                let float = false;
                
                while (this.currentChar !== null && (/\d/.test(this.currentChar) || this.currentChar === '.')) {
                    if (/\d/.test(this.currentChar)){
                        accum += this.currentChar;
                        this.advance();
                    } else if (this.currentChar == '.') {
                        accum += '.'
                        this.advance();
                        float = true;
                    }
                }

                if (float) {
                    return new Token('FLOAT', parseFloat(accum))
                } 
                return new Token('INTEGER', parseInt(accum)); 
            }

            if (this.currentChar === '\"') {
                let accum = '';
                
                this.advance();
                while (this.currentChar !== null && this.currentChar !== '\"') {
                    accum += this.currentChar;
                    this.advance();
                }
                this.advance();

                return new Token('STRING', accum);
            }

            if (/[a-zA-Z]/.test(this.currentChar)) {
                let id = '';
                while (this.currentChar !== null && /[a-zA-Z0-9]/.test(this.currentChar)) {
                    id += this.currentChar;
                    this.advance();
                }

                switch(id){
                    case 'if':{
                        return new Token('IF', id);
                    }
                    case 'elif':{
                        return new Token('ELIF', id);
                    }
                    case 'else':{
                        return new Token('ELSE', id);
                    }
                    case 'while':{
                        return new Token('WHILE', id);
                    }
                    case 'def':{
                        return new Token('DEF', id);
                    }
                    case 'return':{
                        return new Token('RETURN', id);
                    }
                    case 'for':{
                        return new Token('FOR', id);
                    }
                    case 'in':{
                        return new Token('IN', id);
                    }
                    default:{
                        return new Token('ID', id);
                    }
                }
            }

            if (operatorChars.includes(this.currentChar)){
                let operator = '';
                
                while(operatorChars.includes(this.currentChar)){
                    if (operator.length == 2) {
                        break;
                    }
                    if (operator.length == 1 && operator.at(-1) == "=") {
                        if (this.currentChar != "="){
                            break;
                        }
                    }
                    operator += this.currentChar;
                    this.advance();
                }

                switch(operator) {
                    case '+': {
                        return new Token('PLUS', '+');    
                    }
                    case '-': {
                        return new Token('MINUS', '-');    
                    }
                    case '*': {
                        return new Token('MULTIPLY', '*');    
                    }
                    case '/': {
                        return new Token('DIVIDE', '/');    
                    }
                    case '>': {
                        return new Token('GREATERTHAN', '>');    
                    }
                    case '<': {
                        return new Token('LESSTHAN', '<');    
                    }
                    case '<=': {
                        return new Token('LESSTHANOREQUAL', '<=');    
                    }
                    case '>=': {
                        return new Token('GREATERTHANOREQUAL', '>=');    
                    }
                    case '=': {
                        return new Token('ASSIGN', '=');    
                    }
                    case '==': {
                        return new Token('EQUAL', '==');
                    }
                    case '+=': {
                        return new Token('ADDASSIGN', '+=');
                    }
                    case '-=': {
                        return new Token('SUBTRACTASSIGN', '-=');    
                    }
                }
            } else {
                switch(this.currentChar){
                    case '(': {
                        this.advance();
                        return new Token('LPAREN', '(');    
                    }
                    case ')': {
                        this.advance();
                        return new Token('RPAREN', ')');    
                    }
                    case ']': {
                        this.advance();
                        return new Token('RIGHTBRACKET', ']');    
                    }
                    case '[': {
                        this.advance();
                        return new Token('LEFTBRACKET', '[');    
                    }
                    case '}': {
                        this.advance();
                        return new Token('RIGHTBRACE', '}');    
                    }
                    case '{': {
                        this.advance();
                        return new Token('LEFTBRACE', '{');    
                    }
                    case ':': {
                        this.advance();
                        return new Token('COLON', ':');    
                    }
                    case ',': {
                        this.advance();
                        return new Token('COMMA', ',');    
                    }
                    default:{
                        throw new Error(`Invalid operator ${this.currentChar} on line ${this.getLineNumber()}`);
                    }
                }
            }
        }

        return new Token('EOF', '');
    }

    getLineNumber(): number {
        return this.lineNumber + 1;
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