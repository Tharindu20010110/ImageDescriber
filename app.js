const express = require('express');
const multer = require('multer');
const fs = require('fs');
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require('@google/generative-ai');

const app = express();
const upload = multer({ dest: 'uploads/' });

const MODEL_NAME = 'gemini-pro-vision';
const API_KEY = 'AIzaSyCKT-M6zf6UdVmvwVwfEkAcZwgB8cYngrE';

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.single('image'), async (req, res) => {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
    };

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    const parts = [
        { text: 'write a short, description what this picture shows\n' },
        {
            inlineData: {
                mimeType: 'image/jpeg',
                data: fs.readFileSync(req.file.path).toString('base64'),
            },
        },
    ];

    const result = await model.generateContent({
        contents: [{ role: 'user', parts }],
        generationConfig,
        safetySettings,
    });

    const response = result.response;
    res.send(response.text());
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});