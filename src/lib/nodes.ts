const dedent = (str: string): string => {
    return str.split('\n').map(line => line.trimStart()).join('\n');
}


export class Token {
    type: string;
    value: string | number;

    constructor(type: string, value: string | number) {
        this.type = type;
        this.value = value;
    }
    
    toLatex(): string{
        return `${this.value}`;
    }
}

export abstract class ASTNode {
    type: string;

    constructor(type: string) {
        this.type = type;
    }

    abstract toLatex(): string;
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

    toLatex(): string{
        let leftLatex = this.left.toLatex();
        let rightLatex = this.right.toLatex();
        let operatorLatex = this.op.toLatex();

        if(this.left instanceof BinOpNode){
            leftLatex = `(${leftLatex})`;
        }   
        if(this.right instanceof BinOpNode){
            rightLatex = `(${rightLatex})`;
        }   

        return `${leftLatex} ${operatorLatex} ${rightLatex}`;
    }
}

export class NumNode extends ASTNode {
    value: number;

    constructor(value: number) {
        super('Num');
        this.value = value;
    }

    toLatex(): string {
        return `${this.value}`;
    }
}

export class Variable extends ASTNode{
    name: string; 
    
    constructor(name: string) {
        super("Variable");
        this.name = name;
    }

    toLatex(): string {
        return `${this.name}`;
    }
}

export class ExternalFunction extends ASTNode{
    functionName: string; 
    args: ASTNode[];

    constructor(functionName: string, args: ASTNode[]){
        super("ExternalFunction")
        this.functionName = functionName;
        this.args = args;
    }

    toLatex(): string {
        // let argsLatex = "";
        // this.args.forEach(arg => {
        //     argsLatex += arg.toLatex() + ",";
        // })

        let argsLatex = this.args.map(arg => arg.toLatex()).join(',');
        return `\\Call{${this.functionName}}{${argsLatex}}`;
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

    toLatex(): string {
        let innerStatements = "";
        this.statements.forEach(item => {
            innerStatements += item.toLatex() + "\n";
        });
        
        return dedent(
        `\\Function{${this.name}}{${this.arguments}}
        ${innerStatements}
        \\EndFunction`);
    }
}

export interface elifCondStatement {
    condition: ASTNode;
    statements: ASTNode[];
}


export class IfStatement extends ASTNode {
    condition: ASTNode;
    statements: ASTNode[];
    elif: elifCondStatement[];
    elseStatements: ASTNode[];

    constructor(
        condition: ASTNode, 
        statements: ASTNode[], 
        elif: elifCondStatement[],
        elseStatements: ASTNode[]
    ) {
        super('IfStatement');
        this.condition = condition;
        this.statements = statements;
        this.elif = elif;
        this.elseStatements = elseStatements;
    }

    toLatex(): string {
        let innerStatements = "";
        this.statements.forEach(item => {
            innerStatements += item.toLatex() + "\n";
        });

        const cond = this.condition.toLatex();


        let elifLatex = "";

        this.elif.forEach(item => {
            let cond = item.condition.toLatex(); 
            let statementLatex = "";
            item.statements.forEach(statement => {
                statementLatex += statement.toLatex() + "\n";
            });
            elifLatex += dedent(
            `\\ElsIf{$${cond}$}
            ${statementLatex}`) + "\n";
        })
        
        let elseLatex = "";
        
        if (this.elseStatements.length > 0){
            let elseStatements = "";
            this.elseStatements.forEach(item => {
                elseStatements += item.toLatex() + "\n";
            });
            elseLatex = dedent(`\\Else
            ${elseStatements}`);
        }

        return dedent(`
            \\If{$${cond}$}
            ${innerStatements}
            ${elifLatex}
            ${elseLatex}
            \\EndIf`);
        }
}

export class WhileStatement extends ASTNode {
    condition: ASTNode;
    statements: ASTNode[];

    constructor(condition: ASTNode, statements: ASTNode[]) {
        super('WhileStatement');
        this.condition = condition;
        this.statements = statements;
    }

    toLatex(): string {
        let statements = "";
        this.statements.forEach(item => {
            statements += item.toLatex() + "\n";
        })
        
        const condition = (this.condition as BinOpNode).toLatex();
        return dedent(`
            \\While{$${condition}$}
            ${statements}
            \\EndWhile`);
    }
}

export class ForLoop extends ASTNode{
    index: Variable;
    rangeExpression: ExternalFunction | Variable;
    statements: ASTNode[];

    constructor(index: Variable, range: ExternalFunction | Variable, statements: ASTNode[]){
        super("ForLoop")
        this.index = index; 
        this.rangeExpression = range; 
        this.statements = statements;
    }


    toLatex(): string {

        let statements = "";
        this.statements.forEach(item => {
            statements += item.toLatex() + "\n";
        })

        if (this.rangeExpression instanceof ExternalFunction && this.rangeExpression.functionName == "range"){
            if(this.rangeExpression.args.length == 1){
                const end = this.rangeExpression.args[0]
                
                return dedent(`
                \\For{$${this.index.toLatex()} = 0, \\dots, ${end.toLatex()}$}
                ${statements}
                \\EndFor`);

            } else if(this.rangeExpression.args.length == 2){
                const start = this.rangeExpression.args[0]
                const end = this.rangeExpression.args[1]
                
                return dedent(`
                \\For{$${this.index.toLatex()} = ${start.toLatex()}, \\dots, ${end.toLatex()}$}
                ${statements}
                \\EndFor`);
            }
        } 
        return dedent(`
        \\For{$${this.index.toLatex()}$ in $${this.rangeExpression.toLatex()}$}
        ${statements}
        \\EndFor`);
    }
}


export class Assignment extends ASTNode {
    variable: Variable; 
    value: ASTNode;

    constructor(name: Variable, value: ASTNode) {
        super('Assignment');
        this.variable = name;
        this.value = value;
    }

    toLatex(): string{
        const varName = this.variable.name;
        const varVal = this.value.toLatex();
        return `\\State $${varName} \\gets ${varVal}$`
    }
}

export class Return extends ASTNode {
    value: ASTNode;

    constructor(value: ASTNode) {
        super('Return');
        this.value = value;
    }

    toLatex(): string {
        const retVal = this.value.toLatex();
        return `\\State \\Return ${retVal}`;
    }
}

