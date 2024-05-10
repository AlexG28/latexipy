class Token {
    type: string;
    value: string | number;

    constructor(type: string, value: string | number) {
        this.type = type;
        this.value = value;
    }
}

class ASTNode {
    type: string;

    constructor(type: string) {
        this.type = type;
    }
}

class BinOpNode extends ASTNode {
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

class NumNode extends ASTNode {
    value: number;

    constructor(value: number) {
        super('Num');
        this.value = value;
    }
}

class VarNode extends ASTNode {
    value: string;

    constructor(value: string) {
        super('Var');
        this.value = value;
    }
}

class AssignNode extends ASTNode {
    varName: VarNode;
    expr: ASTNode;

    constructor(varName: VarNode, expr: ASTNode) {
        super('Assign');
        this.varName = varName;
        this.expr = expr;
    }
}

class IfNode extends ASTNode {
    condition: ASTNode;
    thenStmts: ASTNode[];
    elseStmts: ASTNode[];

    constructor(condition: ASTNode, thenStmts: ASTNode[], elseStmts: ASTNode[]) {
        super('If');
        this.condition = condition;
        this.thenStmts = thenStmts;
        this.elseStmts = elseStmts;
    }
}

class WhileLoop extends ASTNode{
    condition: ASTNode;
    statement: ASTNode[];

    constructor(condition: ASTNode, statement: ASTNode[]){
        super('While');
        this.condition = condition;
        this.statement = statement;
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
        while (this.currentChar !== null && /\s/.test(this.currentChar as string)) {
            this.advance();
        }
    }

    getNextToken(): Token {
        while (this.currentChar !== null) {
            if (/\s/.test(this.currentChar)) {
                this.skipWhitespace();
                continue;
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
                } else if (id === 'endif') {
                    return new Token('ENDIF', id);
                } else if (id === 'while'){
                    return new Token('WHILE', id);
                } else if (id == 'do'){
                    return new Token('DO', id);
                } else if (id == 'endwhile'){
                    return new Token('ENDWHILE', id);
                }
                return new Token('ID', id);
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

            throw new Error('Invalid character');
        }

        return new Token('EOF', '');
    }
}


export class Parser {
    lexer: Lexer;
    currentToken: Token;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
    }

    eat(tokenType: string) {
        if (this.currentToken.type === tokenType) {
            this.currentToken = this.lexer.getNextToken();
        } else {
            throw new Error('Invalid syntax');
        }
    }

    factor(): ASTNode {
        const token = this.currentToken;
        if (token.type === 'INTEGER') {
            this.eat('INTEGER');
            return new NumNode(token.value as number);
        } else if (token.type === 'LPAREN') {
            this.eat('LPAREN');
            const result = this.expr();
            this.eat('RPAREN');
            return result;
        } else if (token.type === 'ID') {
            return this.varAssign();
        } else if (token.type === 'IF') {
            return this.ifStatement();
        // } else if (token.type === 'WHILE'){
        //     return this.whileStatement();
        } else {
            throw new Error('Invalid syntax');
        }
    }

    term(): ASTNode {
        let node = this.factor();

        while (['MULTIPLY', 'DIVIDE'].includes(this.currentToken.type)) {
            const token = this.currentToken;
            if (token.type === 'MULTIPLY') {
                this.eat('MULTIPLY');
            } else if (token.type === 'DIVIDE') {
                this.eat('DIVIDE');
            }
            node = new BinOpNode(node, token, this.factor());
        }

        return node;
    }

    expr(): ASTNode {
        let node = this.term();

        while (['PLUS', 'MINUS'].includes(this.currentToken.type)) {
            const token = this.currentToken;
            if (token.type === 'PLUS') {
                this.eat('PLUS');
            } else if (token.type === 'MINUS') {
                this.eat('MINUS');
            }
            node = new BinOpNode(node, token, this.term());
        }

        return node;
    }

    varAssign(): ASTNode {
        const varName = new VarNode(this.currentToken.value as string);
        this.eat('ID'); // Consume the variable name
        this.eat('ASSIGN'); // Consume the '=' token
        const expr = this.expr();
        return new AssignNode(varName, expr);
    }

    ifStatement(): ASTNode {
        this.eat('IF'); // Consume the 'if' token
        const condition = this.expr();
        this.eat('THEN'); // Consume the 'then' token
        const thenStmts: ASTNode[] = [];
        while (this.currentToken.type !== 'ELSE' && this.currentToken.type !== 'ENDIF') {
            thenStmts.push(this.factor());
        }
        const elseStmts: ASTNode[] = [];
        if (this.currentToken.type === 'ELSE') {
            this.eat('ELSE'); // Consume the 'else' token
            
            if (this.currentToken.type !== 'ELSE') { // will always be true??????
                while (this.currentToken.type !== 'ENDIF') {
                    elseStmts.push(this.factor());
                }
            }
        }
        this.eat('ENDIF'); // Consume the 'endif' token
        return new IfNode(condition, thenStmts, elseStmts);
    } 

    whileStatement(): ASTNode {
        this.eat('WHILE')
        const condition = this.expr();
        this.eat('DO')

        const statement: ASTNode[] = [];

        while (this.currentToken.type !== 'ENDWHILE') {
            statement.push(this.factor());
        }

        this.eat('ENDWHILE')

        return new WhileLoop(condition, statement)
    }
}
