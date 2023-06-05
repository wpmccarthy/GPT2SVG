const svgWrapper = '<svg id="svgContainer" xmlns="http://www.w3.org/2000/svg" width="400" height="400">';

window.onload = function () {

    const inputText = document.getElementById('inputText');
    const codeBlock = document.getElementById("codeBlock");
    const svgContainer = document.getElementById("svgContainer");

    // form submission
    document.getElementById('gptForm').addEventListener('submit', async (event) => {
        // Prevent the default form submission behavior
        event.preventDefault();

        // BUG UPDATING TEXT RN

        // codeBlock.addEventListener('input', function() {
        //     console.log('codeBlock value has changed:', codeBlock.value);
        // });

        let currentCode;
        
        // Update oninput function
        codeBlock.oninput = function() {
            currentCode = codeBlock.value;

            svgContainer.innerHTML = currentCode; // catching SVG errors is hard as they are data errors, not runtime errors, so they don't throw.
            
        };

        try {
            const response = await fetch('/gpt2svg/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `inputText=${encodeURIComponent(inputText.value)}`
            });

            // console.log(response);
            console.log(response.text);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.text();

            // const data = "```<svg width=\"500\" height=\"500\">\n  <rect x=\"0\" y=\"0\" width=\"500\" height=\"500\" fill=\"#A1D8F0\" />\n  <path d=\"M250 100 Q150 200 200 300 A100 100 0 0 0 300 275 Q250 200 250 100\" fill=\"#3792CB\" stroke=\"#285E8E\" stroke-width=\"5\" />\n  <circle cx=\"220\" cy=\"220\" r=\"30\" fill=\"#FFFFFF\" />\n  <circle cx=\"240\" cy=\"240\" r=\"8\" fill=\"#000000\" />\n  <path d=\"M270 90 Q220 140 220 190 Q230 220 250 230 Q275 235 295 285 Q320 345 340 330 A120 120 0 0 1 300 210 Q295 190 287.5 185 Q280 180 270 165 Q270 130 270 90\" fill=\"#2790C3\" stroke=\"#285E8E\" stroke-width=\"5\" />\n</svg>```"

            textPieces = extractCodeBlocks(data);

            // Update text response on left
            document.getElementById('textBefore').innerText = textPieces['textBefore'];
            currentCode = getSVGContent(textPieces['codeBlock']);
            console.log(currentCode);
            codeBlock.blur();
            codeBlock.value = currentCode;
            codeBlock.style.display = "block";
            autoResizeTextarea(codeBlock);
            document.getElementById('textAfter').innerText = textPieces['textAfter'];
            
            // Update SVG
            svgContainer.innerHTML = currentCode;
            // svgContainer.innerHTML = textPieces['codeBlock'];

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
    
        // Call the autoResizeTextarea function initially to fit the content
        
    
        // Add an event listener for the 'input' event to resize the textarea
        inputText.addEventListener('input', () => autoResizeTextarea(inputText));
        codeBlock.addEventListener('input', () => autoResizeTextarea(codeBlock));

};


// Extract code blocks from markdown string and surrounding text
function extractCodeBlocks(markdown) {
    // Regular expression to match code blocks
    const codeBlockRegex = /```([\s\S]*?)```/g;

    let match;
    let lastIndex = 0;
    let textBefore = '';
    let textAfter = '';
    let codeBlock = '';

    if ((match = codeBlockRegex.exec(markdown)) !== null) {
        textBefore = markdown.substring(0, match.index).trim();
        codeBlock = match[1].trim();
        lastIndex = codeBlockRegex.lastIndex;
    }

    textAfter = markdown.substring(lastIndex).trim();

    const svgPrefixRegex = /^svg/;

    // Remove the 'svg' prefix if it exists
    if (svgPrefixRegex.test(codeBlock)) {
        codeBlock = codeBlock.replace(svgPrefixRegex, "").trim();
    }

    return {
        textBefore: textBefore,
        codeBlock: codeBlock,
        textAfter: textAfter
    };
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

const parser = new DOMParser();

function getSVGContent(svgString) {
    var matches = svgString.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    match = matches ? matches[1] : null;
    stripped = stripIndent(match);

    return stripped
}


function stripIndent(svgString, max=8) {

    let newString = svgString;

    i = 0
    while (i<max) {
        newString = newString.replace(/ </g,"<");
        i++;
    }

    // remove empty line
    newString = newString.replace(/^\s*[\r\n]/gm, "");
    
    return newString
    
}
