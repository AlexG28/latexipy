import { Token } from "../lib/nodes";


export class Lexer {
    text: string;
    pos: number;
    currentChar: string | null;
    currentIndent: number;

    constructor(text: string) {
        this.text = this.removeEmptyLines(text);
        this.pos = 0;
        this.currentChar = this.text[this.pos];
        this.currentIndent = 0;
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

                switch(id){
                    case 'if':{
                        return new Token('IF', id);
                        break;
                    }
                    case 'elif':{
                        return new Token('ELIF', id);
                        break;
                    }
                    case 'else':{
                        return new Token('ELSE', id);
                        break;
                    }
                    case 'while':{
                        return new Token('WHILE', id);
                        break;
                    }
                    case 'def':{
                        return new Token('DEF', id);
                        break;
                    }
                    case 'return':{
                        return new Token('RETURN', id);
                        break;
                    }
                    case 'for':{
                        return new Token('FOR', id);
                        break;
                    }
                    case 'in':{
                        return new Token('IN', id);
                        break;
                    }
                    default:{
                        return new Token('ID', id);
                        break;
                    }
                }
            }

            if (operatorChars.includes(this.currentChar)){
                let operator = '';
                
                while(operatorChars.includes(this.currentChar)){
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
                    case '+=': {
                        return new Token('ASSIGN', '+=');    
                    }
                    case '-=': {
                        return new Token('ASSIGN', '-=');    
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
                    case ':': {
                        this.advance();
                        return new Token('COLON', ':');    
                    }
                    case ',': {
                        this.advance();
                        return new Token('COMMA', ',');    
                    }
                    default:{
                        throw new Error('Invalid character');
                    }
                }
            }

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