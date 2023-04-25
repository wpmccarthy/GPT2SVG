// Import the required packages
const express = require('express');
const path = require('path');
const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");
const bodyParser = require('body-parser');


// Setup OPENAI
let configuration;
let openai;

// Read the contents of the file using the 'readFile' method
fs.readFile("./open_ai_auth.txt", 'utf8', (err, data) => {
  // If an error occurs, log the error and exit
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  process.env.OPENAI_API_KEY = data;
  // console.log(process.env.OPENAI_API_KEY);

  configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  openai = new OpenAIApi(configuration);

});




// Create an instance of the Express app
const app = express();
app.use(bodyParser.json()); // For handling JSON data
app.use(bodyParser.urlencoded({ extended: false })); // For handling form data

// Set the listening port for the server
const PORT = process.env.PORT || 3000;

app.get('/*', (req, res) => {
    // console.log('requesting')
    serveFile(req, res);
  });
  

// Serve files
var serveFile = function (req, res) {
    var fileName = req.params[0];
    // console.log('\t File requested: ' + fileName);
    return res.sendFile(fileName, { root: __dirname });
};

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// Handle the POST request from form
app.post('/send-message', async (req, res) => {

  const inputText = req.body.inputText;
  console.log(inputText);

  try {
    // const completion = await openai.createCompletion({
    //   model: "gpt-3.5-turbo",
    //   prompt: inputText,
    // });

    messages = [
      // {"role": "system", "content": "You are a mischievous graphic designer. You will be provided with a prompt and return svg code of a graphic that looks like that prompt. Please comment your code. Funny graphics only."},
      // {"role": "system", "content": "You are a helpful assistant. You will be provided with a prompt and return svg code of a graphic that looks like that prompt. Use <svg width=400 height=400>. Please comment your code."},
      {"role": "system", "content": "You are a graphic designer. You will be provided with a prompt and return svg code of a graphic that looks like that prompt. Use <svg width=400 height=400>. Please comment your code."},
      {"role": "user", "content": inputText},
     ];

     console.log(messages);

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      // model: "gpt-4", //no access
      messages : messages
    });

    console.log(completion.data.choices);
    // console.log(completion.data.choices[0].text);
    // res.send(`Original request: ${inputText} - Response: ${completion.data.choices[0].message.content}`);

    res.send(completion.data.choices[0].message.content);

    exportFile(completion.data, inputText, messages);

    // res.send(completion.data.choices);

  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
});


exportFile = function(completionData, inputText, messages){

  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');

  const dateTimeString = `${year}-${month}-${day}_${hours}:${minutes}:${seconds}`;
  console.log(dateTimeString);

  fileName =  inputText.replace(" ", '_') + '-' +dateTimeString

  let data = {
    completionData: completionData,
    inputText: inputText,
    messages: messages
  };

  // Convert the data object to a JSON string
  const jsonString = JSON.stringify(data, null, 2);

  // Write the JSON string to a new file named 'output.json'
  fs.writeFile('./response_archive/'+fileName+'.json', jsonString, (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log('JSON file created successfully.');
    }
  });

}