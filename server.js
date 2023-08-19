const express = require('express');
const { OpenAIAPI } = require('openai');

const app = express();
const openai = new OpenAIAPI({
  key: process.env.OPENAI_API_KEY
});

app.use(express.json());

app.post('/ask', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const response = await openai.complete({
      prompt: prompt,
      max_tokens: 150
    });
    res.send(response.data.choices[0].text.trim());
  } catch (error) {
    console.error(error);
    res.status(500).send('Error while fetching response from OpenAI');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
