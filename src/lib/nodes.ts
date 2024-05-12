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