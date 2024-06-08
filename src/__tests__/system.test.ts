import { Lexer } from "$lib/lexer";
import { Parser } from "$lib/parser";
import { ASTToLatex } from "$lib/asttolatex"; 

import { expect, test } from 'vitest';

const dedent = (str: string): string => {
    return str.split('\n').map(line => line.trimStart()).join('\n');
}


test('global system test', ()=> {
    const input_text = 
`def increaseDividend(): 
    dividend=28`;
   
    const lexer = new Lexer(input_text);
    const parser = new Parser(lexer);
    const ast = parser.beginFunction(0);

    const converter = new ASTToLatex(ast);
    const result = converter.convert();

    const expected = dedent(
        `\\begin{algorithm}
        \\caption{increaseDividend}
        \\begin{algorithmic}
        \\Function{increaseDividend}{}
        \\State $dividend \\gets 28$
        \\EndFunction
        \\end{algorithmic}
        \\end{algorithm}`);

    expect(result).toEqual(expected);
})


test('system test with lists and for loops', ()=> {

    const input_text = 
`def listTest(a,b): 
    a = [1,2,3]
    for letter in a: 
        letter = letter + 2`;
   
    const lexer = new Lexer(input_text);
    const parser = new Parser(lexer);
    const ast = parser.beginFunction(0);

    const converter = new ASTToLatex(ast);
    const result = converter.convert();

    const expected = dedent(
        `\\begin{algorithm}
        \\caption{listTest}
        \\begin{algorithmic}
        \\Function{listTest}{a,b}
        \\State $a \\gets [1,2,3]$

        \\For{$letter$ in $a$}
        \\State $letter \\gets letter + 2$
        \\EndFor
        \\EndFunction
        \\end{algorithmic}
        \\end{algorithm}`);

    expect(result).toEqual(expected);
})


test('system test 2', ()=> {

    const input_text = 
`def hello(s): 
    lettersToRemove = 0
    output = 14

    for char in s: 
        if char == 18:
            lettersToRemove += 1
        else: 
            if lettersToRemove > (0+13): 
                lettersToRemove -= 1
            else: 
                output += char

    return output`;
   
    const lexer = new Lexer(input_text);
    const parser = new Parser(lexer);
    const ast = parser.beginFunction(0);

    const converter = new ASTToLatex(ast);
    const result = converter.convert();

    const expected = dedent(
    `\\begin{algorithm}
    \\caption{hello}
    \\begin{algorithmic}
    \\Function{hello}{s}
    \\State $lettersToRemove \\gets 0$
    \\State $output \\gets 14$
    
    \\For{$char$ in $s$}
    
    \\If{$char == 18$}
    \\State $lettersToRemove \\gets lettersToRemove + 1$
    
    \\Else
    
    \\If{$lettersToRemove > (0 + 13)$}
    \\State $lettersToRemove \\gets lettersToRemove - 1$
    
    \\Else
    \\State $output \\gets output + char$
    \\EndIf
    \\EndIf
    \\EndFor
    \\State \\Return output
    \\EndFunction
    \\end{algorithmic}
    \\end{algorithm}`);

    expect(result).toEqual(expected);
})


test('system test 3', ()=> {

    const input_text = 
`def generateFibonacci(n): 
    fibnumbers = []
    a = 0
    b = 1
    if n > 0:
        fibnumbers = fibnumbers + [a]
    if n > 1:
        fibnumbers = fibnumbers + [b]
    count = 2
    while count < n:
        nextnum = a + b
        fibnumbers = fibnumbers + [nextnum]
        a = b
        b = nextnum
        count += 1
    return fibnumbers`;
   
    const lexer = new Lexer(input_text);
    const parser = new Parser(lexer);
    const ast = parser.beginFunction(0);

    const converter = new ASTToLatex(ast);
    const result = converter.convert();

    const expected = dedent(
    `\\begin{algorithm}
    \\caption{generateFibonacci}
    \\begin{algorithmic}
    \\Function{generateFibonacci}{n}
    \\State $fibnumbers \\gets []$
    \\State $a \\gets 0$
    \\State $b \\gets 1$
    
    \\If{$n > 0$}
    \\State $fibnumbers \\gets fibnumbers + [a]$
    
    
    \\EndIf
    
    \\If{$n > 1$}
    \\State $fibnumbers \\gets fibnumbers + [b]$
    
    
    \\EndIf
    \\State $count \\gets 2$
    
    \\While{$count < n$}
    \\State $nextnum \\gets a + b$
    \\State $fibnumbers \\gets fibnumbers + [nextnum]$
    \\State $a \\gets b$
    \\State $b \\gets nextnum$
    \\State $count \\gets count + 1$
    \\EndWhile
    \\State \\Return fibnumbers
    \\EndFunction
    \\end{algorithmic}
    \\end{algorithm}`);

    expect(result).toEqual(expected);
})