import { ExpressionParser } from "$lib/parser";
import { expect, test } from 'vitest'



// things to add: subtract and divide. Also Floats. 

test('Updated parser version math', ()=> { 
    const parser = new ExpressionParser();
    let res = parser.parse("2*6+4*5")

    expect(res).toEqual(32)
})

test('Updated parser version ast', ()=> { 
    const parser = new ExpressionParser();
    let res = parser.parse_ast("2*6+4*5")

    expect(res).toEqual(["+", ["*", 2, 6], ["*", 4, 5]])
})


test('recursion test 1', ()=> { 
    const parser = new ExpressionParser();
    let res = parser.parse("((2*6)+(4*5))")

    expect(res).toEqual(32)
})

test('recursion test 2', ()=> { 
    const parser = new ExpressionParser();
    let res = parser.parse("2*(6*1)+(2*4)*(1+1+1+1+1)" )

    expect(res).toEqual(52)
})


test('recursion ast', ()=> { 
    const parser = new ExpressionParser();
    let res = parser.parse_ast("2*(6*1)+(2*4)*(1+1+1+1+1)" )
    expect(res).toEqual(["+", ["*", 2, 6], ["*", 8, 5]])

})

test('recursion ast 2', ()=> { 
    const parser = new ExpressionParser();
    let res = parser.parse_ast(
    `2*(6*1)+(2*4)*
    (1+1+1+
    1+1)`)
    expect(res).toEqual(["+", ["*", 2, 6], ["*", 8, 5]])

})


test('whitespace 1', ()=> { 
    const parser = new ExpressionParser();
    let res = parser.parse("1   +2" )
    expect(res).toEqual(3)
})

test('whitespace 2', ()=> { 
    const parser = new ExpressionParser();
    let res = parser.parse("8*  ( 9  )" )
    expect(res).toEqual(72)
})


test('multiline comments 1', ()=> {
    const parser = new ExpressionParser();
    let res = parser.parse("1+#+1#5") 
    expect(res).toEqual(6)
})


test('multiline comments 2', ()=> {
    const parser = new ExpressionParser();
    let res = parser.parse("8*  #( 9  )#2") 
    expect(res).toEqual(16)
})

test('multiline comments 3', ()=> {
    const parser = new ExpressionParser();
    let res = parser.parse("1+1#+1#") 
    expect(res).toEqual(2)
})

test('significant whitespace test 1', ()=> {
    const parser = new ExpressionParser();
    let inp = `(1
    *1)`
    let res = parser.parse(inp) 
    expect(res).toEqual(1)
})

test('significant whitespace test 2', ()=> {
    const parser = new ExpressionParser();
    let inp = `3*(
    1+4*
    2+
    2)`
    let res = parser.parse(inp) 
    expect(res).toEqual(33)
})
