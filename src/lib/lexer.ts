import { Token } from "../lib/nodes";


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
                } else if (id === 'elif') {
                    return new Token('ELIF', id);
                } else if (id === 'else') {
                    return new Token('ELSE', id);
                } else if (id === 'while'){
                    return new Token('WHILE', id);
                } else if (id === 'def') {
                    return new Token('DEF', id);
                } else if (id === 'return') {
                    return new Token('RETURN', id);
                } else if (id === 'for') {
                    return new Token('FOR', id);
                } else if (id === 'in') {
                    return new Token('IN', id);
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