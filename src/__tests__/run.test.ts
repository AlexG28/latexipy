import { Parser } from "$lib/parser";
import { expect, test } from 'vitest'



test('test basic ast', () => {
    const parser = new Parser("");
    const num = `1232222`;
    const ans = parser.parse(num);

    const expected = {
        type: 'NumericLiteral', 
        value: Number(num), 
        left: null, 
        right: null 
    }
    
    console.log(ans)

}); 