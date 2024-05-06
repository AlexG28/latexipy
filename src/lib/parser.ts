export class ExpressionParser{
    input: string;
    pos: number;
    peek: string;
    indent: number;

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
    
    next() {
        let c = this.peek; 
        this.read()
        return c;
    }

    split(operator: string, func: CallableFunction) {
        for (;;) { 
            func(); 
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

    expr(ind: number): number {
        let sum = 0 
        this.split('+', () => {
            let prod: number = 1
            this.split('*', () => {
                if (this.peek == '\n' && this.indent > ind) {
                    this.next()
                    prod *= this.expr(this.indent)
                    if (this.peek == '\n' && this.indent == ind) {
                        this.next()
                    }
                } else if (this.peek == '(') {
                    this.next()
                    prod *= this.expr(ind)
                    this.next()
                } else {
                    prod *= this.number()
                }
            })
            sum += prod
        })
        return sum
    }


    expr_ast(ind: number): any[] {
        let output: any[] = ["+"]

        this.split('+', () => {
            let local: any[] = ["*"]
            this.split('*', () => {
                if (this.peek == '\n' && this.indent > ind) {
                    this.next()
                    local.push(this.expr(this.indent))
                    if (this.peek == '\n' && this.indent == ind) {
                        this.next()
                    }
                } else if (this.peek == '(') {
                    this.next()
                    local.push(this.expr(ind))
                    this.next()
                } else {
                    local.push(this.number())
                }
            })
            output.push(local)
        })
        return output
    }

    parse(s: string) {
        this.init(s)
        let res = this.expr(this.indent)
        return res
    } 

    parse_ast(s: string) {
        this.init(s)
        let res = this.expr_ast(this.indent) 

        return res
    }
}