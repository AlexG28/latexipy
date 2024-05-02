export class Parser {
    _string: string;

    constructor(string: string){
        this._string = string
    }

    parse(string: string){ 
        this._string = string;
        return this.Program();
    }

    Program() {
        return this.NumericLiteral()
    }

    NumericLiteral() {
        return {
            type: 'NumericLiteral', 
            value: Number(this._string),
            left: null,
            right: null, 
        }
    }

    hello() {
        return "hello there!"
    }

}