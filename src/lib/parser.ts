interface Operators {
    [key: string]: (x: number, y: number) => number;
}

interface Precedence {
    [key: string]: number;
}
interface Associativity {
    [key: string]: number;
}

export class ExpressionParser{
    input: string;
    pos: number;
    peek: string;
    indent: number;
    eval: Operators = {
        "+": (x: number,y: number) => x+y,
        "-": (x: number,y: number) => x-y,
        "*": (x: number,y: number) => x*y,
        "/": (x: number,y: number) => x/y
    }; 

    prec: Precedence = {
        '+': 100,
        '-': 100,
        '*': 200,
        '/': 200
    }; 

    assoc: Associativity = {
        '+': 1,
        '-': 1,
        '*': 1,
        '/': 1
    };

    constructor(){
        this.input = ""
        this.pos = 0
        this.peek = ""
        this.indent = 0
    }


    init(s: string){ 
        this.input = s; 
        this.pos = 0; 
        this.indent = this.whitespace()
        this.read();
    }

    read() {
        this.whitespace()
        this.multiline_comment()
        this.peek = this.input[this.pos++]
        if (this.peek == '\n') {
            this.indent = this.whitespace()
        }
    }

    whitespace() { 
        let start = this.pos 
        while (this.input[this.pos] == ' '){
            this.pos++
        }

        return this.pos - start
    }


    multiline_comment() {
        if (this.input[this.pos] == '#'){
            this.pos++
            while(this.input[this.pos] != '#'){
                this.pos++
            }
            this.pos++
        }
    }
    
    next(): string {
        let c = this.peek; 
        this.read()
        return c;
    } 

    error(msg: string) {
        while(
            this.peek &&
            this.peek != '\n' && 
            this.peek != '*' && 
            this.peek != '+' && 
            this.peek != ')'
        ){
            this.next()
        }
        throw new Error(msg)
    }

    expect(d: string) {
        if (this.peek == d) {
            this.next()
        } else {
            try { this.error(d + " expected") } 
            catch (ex) {
                if (this.peek == d) {
                    this.next() 
                } else{
                    throw ex
                }
            }
        }
    }

    factor(): number {
        if (this.peek == '(') {
            this.next()
            let res = this.expr() 
            this.next() 
            return res
        } else {
            return this.number()
        }
    }

    term(): number {
        let res: number = this.factor()
        while (this.peek == '*' || this.peek == '/'){
            let next_elem: string = this.next()
            let function_to_execute: CallableFunction = this.eval[next_elem];
            res = function_to_execute(res, this.factor());
        }
        return res
    }

    binop(min: number): number{
        let res = this.factor()
        while (this.peek in this.prec && this.prec[this.peek] >= min){
            let nextMin: number = this.prec[this.peek] + this.assoc[this.peek] 
            res = this.eval[this.next()](res, this.binop(nextMin))
        }
        return res        
    }

    split(operator: string, func: CallableFunction) {
        for (;;) { 
            try {
                func()
            } catch (ex) { }

            if (this.peek == operator) this.next(); 
            else break 
        }
    }

    
    number(): number { // creates the full number, can be better done with regex
        let isDigit = () => '0' <= this.peek && this.peek <= '9'

        let n = Number(this.next())
        while(isDigit()){
            n = n * 10 + Number(this.next())
        }
        return n
    }

    // expr(ind: number): number {
    //     let sum = 0 
    //     this.split('+', () => {
    //         let prod: number = 1
    //         this.split('*', () => {
    //             if (this.peek == '\n' && this.indent > ind) {
    //                 this.next()
    //                 prod *= this.expr(this.indent)
    //                 if (this.peek == '\n' && this.indent == ind) {
    //                     this.next()
    //                 }
    //             } else if (this.peek == '(') {
    //                 this.next()
    //                 prod *= this.expr(ind)
    //                 this.next()
    //             } else {
    //                 prod *= this.number()
    //             }
    //         })
    //         sum += prod
    //     })
    //     return sum
    // }

    expr() {
        // let res = this.term() 
        // while( this.peek == '+' || this.peek == '-') {
        //     res = this.eval[this.next()](res, this.term())
        // }
        // return res
        return this.binop(0)
    }


    // expr_ast(ind: number): any[] {
    //     let output: any[] = ["+"]

    //     this.split('+', () => {
    //         let local: any[] = ["*"]
    //         this.split('*', () => {
    //             if (this.peek == '\n' && this.indent > ind) {
    //                 this.next()
    //                 local.push(this.expr(this.indent))
    //                 if (this.peek == '\n' && this.indent == ind) {
    //                     this.next()
    //                 }
    //             } else if (this.peek == '(') {
    //                 this.next()
    //                 local.push(this.expr(ind))
    //                 this.next()
    //             } else {
    //                 local.push(this.number())
    //             }
    //         })
    //         output.push(local)
    //     })
    //     return output
    // }

    parse(text: string) {
        this.init(text)
        // let res = this.expr(this.indent)
        let res = this.expr()
        return res
    } 
 
    // parse_ast(s: string) {
    //     this.init(s)
    //     let res = this.expr_ast(this.indent) 

    //     return res
    // }
}