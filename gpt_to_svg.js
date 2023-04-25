window.onload = function(){
        
    document.getElementById('gptForm').addEventListener('submit', async (event) => {
        // Prevent the default form submission behavior
        event.preventDefault();
    
        const inputText = document.getElementById('inputText').value;
    
        try {
            const response = await fetch('/send-message', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `inputText=${encodeURIComponent(inputText)}`,
            });

            // console.log(response);
            console.log(response.text);
        
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
        
            const data = await response.text();
            document.getElementById('response').innerText = data;
            document.getElementById('codeResponse').innerHTML = extractCode(data);

        } catch (error) {
            console.error('Error:', error);
            document.getElementById('response').innerText = 'An error occurred while processing your request.';
        }
    });

};


extractCode = function (text) {

    code = findTextBetweenChars(text, "```", "```");
    console.log(code);
    // todo: check if SVG
    return code;

}

function findTextBetweenChars(text, startChar, endChar) {
    const regex = new RegExp(`\\${startChar}([^${endChar}]+)\\${endChar}`, 'g');
    const matches = [];
    let match;
  
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }
  
    return matches;
  }
  