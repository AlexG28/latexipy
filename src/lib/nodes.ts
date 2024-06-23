const dedent = (str: string): string => {
    return str.split('\n').map(line => line.trimStart()).join('\n');
}

interface OperationMap {
    [key: string]: string;
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

export class StringNode extends ASTNode {
    value: string;

    constructor(value: string) {
        super('String');
        this.value = value;
    }

    toLatex(): string {
        return `\\texttt{\"${this.value}\"}`
    }
}

export class Slice {
    start: ASTNode | null;
    stop: ASTNode | null;
    step: ASTNode | null;

    constructor(start: ASTNode | null, stop: ASTNode | null, step: ASTNode | null) {
        this.start = start
        this.stop = stop
        this.step = step
    }

    toLatex(): string {
        let startLatex = ""
        let stopLatex = ""
        let stepLatex = ""

        if (this.start != null) {
            startLatex = this.start.toLatex();
        }
        if (this.stop != null) {
            stopLatex = this.stop.toLatex();
        }
        if (this.step != null) {
            stepLatex = this.step.toLatex();
        }
        
        if (this.start != null && this.stop != null && this.step != null) {
            const elements =  [startLatex, stopLatex, stepLatex].join(":")
            return `[${elements}]`;
        }

        if (this.start != null && this.stop != null && this.step == null) {
            const elements =  [startLatex, stopLatex].join(":")
            return `[${elements}]`;
        } 
        
        if (this.start != null && this.stop == null && this.step == null) {
            const elements =  [startLatex].join(":")
            return `[${elements}]`;
        } 

        const elements =  [startLatex, stopLatex, stepLatex].join(":")
        return `[${elements}]`;
    }
}

export class Variable extends ASTNode{
    name: string; 
    slice: Slice | null;
    constructor(name: string, slice: Slice | null) {
        super("Variable");
        this.name = name;
        this.slice = slice
    }

    toLatex(): string {
        if (this.slice != null){
            const sliceLatex = this.slice.toLatex();
            return `${this.name}${sliceLatex}`
        }
        return `${this.name}`;
    }
}

export class List extends ASTNode{
    elements: ASTNode[];
    
    constructor(elements: ASTNode[]){
        super("List")
        this.elements = elements
    }

    toLatex(): string {
        const elements = this.elements.map(elem => elem.toLatex()).join(",");
        
        return `[${elements}]`
    }
}

export class KeyValue {
    key: ASTNode;
    value: ASTNode;

    constructor(key: ASTNode, value: ASTNode) {
        this.key = key;
        this.value = value;
    }

    toLatex(): string {
        return `${this.key.toLatex()}:${this.value.toLatex()}`;
    }
}

export class Dict extends ASTNode{
    elements: KeyValue[];
    
    constructor(elements: KeyValue[]){
        super("Dict")
        this.elements = elements
    }

    toLatex(): string {
        const elements = this.elements.map(elem => elem.toLatex()).join(",");
        
        return `\\{${elements}\\}`
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
        let innerStatements = this.statements.map(item => item.toLatex()).join("\n");
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
        let innerStatements = this.statements.map(item => item.toLatex()).join('\n');
        const cond = this.condition.toLatex();


        let elifLatex = "";

        this.elif.forEach(item => {
            let cond = item.condition.toLatex(); 
            let statementLatex = item.statements.map(statement => statement.toLatex()).join("\n");
            elifLatex += dedent(
            `\\ElsIf{$${cond}$}
            ${statementLatex}`) + "\n";
        })
        
        let elseLatex = "";
        
        if (this.elseStatements.length > 0){
            
            let elseStatements = this.elseStatements.map(item => item.toLatex()).join("\n");
            
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
        let statements = this.statements.map(item => item.toLatex()).join("\n");
       
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
        let statements = this.statements.map(item => item.toLatex()).join("\n");

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
    operator: string;
    value: ASTNode;
    
    operationMap: OperationMap = {
        'ADDASSIGN': '+',
        'SUBTRACTASSIGN': '-'
    };
    
    constructor(name: Variable, operator: string, value: ASTNode) {
        super('Assignment');
        this.variable = name;
        this.operator = operator;
        this.value = value;
    }
        
    toLatex(): string{
        let output = "";

        if(["ADDASSIGN", "SUBTRACTASSIGN"].includes(this.operator)){
            const varName = this.variable.toLatex();
            const varVal = this.value.toLatex();
            const operatorChar = this.operationMap[this.operator];
            output = `\\State $${varName} \\gets ${varName} ${operatorChar} ${varVal}$`
        } else {
            const varName = this.variable.toLatex();
            const varVal = this.value.toLatex();
            output =  `\\State $${varName} \\gets ${varVal}$`
        }

        return output
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

