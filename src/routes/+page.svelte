<div class="container">
    <div class="left-box">
        <h2>Python Code</h2>
        <textarea bind:value={leftText} placeholder="Enter text here"></textarea>
    </div>
    
    <button on:click={convertText}>Convert</button>
  
    <div class="right-box">
        <h2>Latex</h2>
        <textarea bind:value={rightText} placeholder="Enter text here"></textarea>
    </div>
</div>


<script>
    let leftText = '';
    let rightText = '';

    function convertText() {
        console.log('Converted text:', leftText);
        rightText = leftText
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
</style>