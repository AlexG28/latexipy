<h1 id="latexipy-pseudocode-made-easy">LatexiPy - Pseudocode made easy</h1>

<div class="container">
    <div class="left-box">
        <h2>Python Code</h2>
        <textarea id="inputTextBox" class="input" bind:value={leftText} on:keydown={handleKeyDown} placeholder="Enter text here"></textarea>
    </div>
    
    <button class="convertButton" on:click={convertText}>Convert</button>
  
    <div class="right-box">
        <h2>Latex</h2>
        <textarea class="input" bind:value={rightText} placeholder="Enter text here"></textarea>
    </div>
</div>
  
<div class="instructions">
  <h2 id="what-is-latexipy-">What is LatexiPy?</h2>
  <p>LatexiPy is a python code to latex pseudocode converter. Paste in a valid python function in the left textbox, click convert, and receive a LaTex pseudo-code equivalent in the right textbox. </p>
  <p>Ensure that you also paste in the following imports into latex: <code>algorithm</code> and <code>algpseudocodex</code> </p>
  <h2 id="why-is-latexipy-needed-">Why is LatexiPy needed?</h2>
  <p>There are currently no easy ways of converting code to pseudocode. The options are doing it manually or through an LLM. Both methods are not ideal. LatexiPy seeks to solve this problem. </p>
  <h2 id="how-does-it-work-">How does it work?</h2>
  <p>LatexiPy employs a lexer and a parser to generate an abstract syntax tree of the python function which is then converted to latex pseudocode. The frontend framework chosen is SvelteKit due to its ease of use and high performance.</p>
  <h2 id="supported-syntax">Supported syntax</h2>
  <p>LatexiPy supports a large chunk of the python syntax. Int, float and string literals, lists, for and while loops, control flow, function calls and arithmetic expressions are all supported.</p>
  <h2 id="unsupported-syntax">Unsupported syntax</h2>
  <p>Some features that are not yet implemented include:</p>
  <ul>
      <li>operators such as <code>*=</code>, <code>/=</code> and others </li>
      <li>negative signs in front of variables. Instead of writing <code>-num</code>, you can write <code>-1*num</code> </li>
  </ul>
  <p>Additionally, some features are unsupported due to them having no equivalent in latex pseudocode </p>
  <ul>
      <li>object.function calls such as <code>list.find()</code></li>
      <li>list comprehension</li>
  </ul>
</div>

<script>
    import { Lexer } from "$lib/lexer";
    import { Parser } from "$lib/parser";
    import { ASTToLatex } from "$lib/asttolatex"; 

    let leftText = '';
    let rightText = '';

    function convertText() {
      try {
        const lexer = new Lexer(leftText);
        const parser = new Parser(lexer);
        const ast = parser.beginFunction(0);
  
        const converter = new ASTToLatex(ast);
        rightText = converter.convert();

      } catch (error) {
        if (error instanceof Error) {
          alert(error.message)
        }
      }
    }  
    
    
    function handleKeyDown(event) {
      if (event.key === 'Tab') {
        event.preventDefault();

        const textarea = event.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        

        leftText = leftText.substring(0, start) + '    ' + leftText.substring(end);

        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 4;
        }, 0);

      }
    }


</script>


<style>
    :global(body){
      margin: 0;
      padding: 0;
      background-color: #333;
      color: #fff;
      font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    }
    .container {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      background-color: #333;
    }

    @media (max-width: 700px) {
      .container{
        flex-direction: column;
        align-items: center;
      }

      .left-box,
      .right-box {
        width: 100%;
        margin-bottom: 20px;
      }

      .convertButton {
        margin-bottom: 20px;
      }
    }

    .left-box,
    .right-box {
      width: 45%;
      padding: 20px;
      border: 1px solid #555;
      border-radius: 5px;
      background-color: #444;
      color: #fff; 
    }

    .input {
      width: 95%;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #555; 
      border-radius: 5px;
      background-color: #555; 
      color: #fff; 
    }

    textarea {
      width: 100%;
      height: 200px;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #555;
      border-radius: 5px;
      background-color: #555; 
      color: #fff; 
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


    .instructions {
        max-width: 800px;
        margin: 20px auto;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
    }

    .instructions h2 {
        border-bottom: 2px solid #007acc;
        padding-bottom: 10px;
        margin-bottom: 20px;
        color: #007acc;
    }

    .instructions p {
        margin-bottom: 20px;
        text-align: justify;
    }

    .instructions ul {
        margin-bottom: 20px;
        padding-left: 20px;
    }

    .instructions ul li {
        margin-bottom: 10px;
    }

    .instructions code {
        background-color: #3b3b3b;
        padding: 2px 4px;
        border-radius: 4px;
        color: #3fe929;
    }

</style>