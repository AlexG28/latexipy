<div class="container">
    <div class="left-box">
        <h2>Python Code</h2>
        <textarea bind:value={leftText} placeholder="Enter text here"></textarea>
    </div>
    
    <button class="convertButton" on:click={convertText}>Convert</button>
  
    <div class="right-box">
        <h2>Latex</h2>
        <textarea bind:value={rightText} placeholder="Enter text here"></textarea>
    </div>
</div>


<script>
    import { Lexer } from "$lib/lexer";
    import { Parser } from "$lib/parser";
    import { ASTToLatex } from "$lib/asttolatex"; 

    let leftText = '';
    let rightText = '';

    function convertText() {
      const lexer = new Lexer(leftText);
      const parser = new Parser(lexer);
      const ast = parser.beginFunction(0);

      const converter = new ASTToLatex(ast);
      rightText = converter.convert();

    }
</script>


<style>
    .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  
    .left-box,
    .right-box {
      width: 45%;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
  
    input {
      width: 100%;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
  
    textarea {
      width: 100%;
      height: 200px;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }

    .convertButton {
      background-color: #4CAF50;
      border: none;
      color: white;
      padding: 15px 32px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;
      border-radius: 12px;
      transition: background-color 0.3s ease, transform 0.3s ease;
    }

    .convertButton:hover {
      background-color: #45a049;
      transform: scale(1.05);
    }

    .convertButton:active {
      background-color: #3e8e41;
      transform: scale(1);
    }

</style>