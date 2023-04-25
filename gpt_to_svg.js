window.onload = function(){
        


    // form submission
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


    // expanding textarea

    function autoResizeTextarea(textarea) {
        // Set the textarea's height to 'auto' to calculate the scroll height
        textarea.style.height = 'auto';
        
        // Set the textarea's height to its scroll height to fit the content
        textarea.style.height = textarea.scrollHeight + 'px';
    }
    
    const textarea = document.getElementById('inputText');
    
    // Call the autoResizeTextarea function initially to fit the content
    autoResizeTextarea(textarea);
    
    // Add an event listener for the 'input' event to resize the textarea
    textarea.addEventListener('input', () => autoResizeTextarea(textarea));
    

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