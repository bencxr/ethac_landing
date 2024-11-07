import 'dotenv/config';
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPI_KEY });
import axios from "axios";

async function fetchHTML(url) {
    try {
        const { data } = await axios.get(url);
        console.log(`Fetched from network: ${url}`);
        return data;
    }
    catch (error) {
        console.error('Error fetching the HTML:', error);
        throw error;
    }
}

const url = "https://vitalik.eth.ac/general/2024/10/14/futures1.html";
const html = await fetchHTML(url);

import * as cheerio from 'cheerio';
const loadedCheerio = cheerio.load(html);
const body = loadedCheerio('body').text();
const title = loadedCheerio('title').text();

console.log(`
    Title: ${title.length} characters
    Text: ${body.length} characters
    HTML: ${html.length} characters
    ====
    `);

let content = `
            Title: ${title}
            Text: ${body}
            HTML: ${html}
            `;
let completion;

const tryCompletion = async (content) => {
    return await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a secretary generating a summary of a website so your boss can decide if they want to read it. You are given the title, text and html of the website. Please generate a very dense and concise 3 sentence summary with no more than 25 words. In the first short sentence, provide background information about the website itself. Then, summarize the content of the website, including as much detail as possible. If relevant, include what the user is able to do on the website." },
            {
                role: "user",
                content
            },
        ],
    });
};

try {
    completion = await tryCompletion(content);
} catch (error) {
    if (error.code === 'context_length_exceeded') {
        console.error(error.message);
        console.log('Context length exceeded. Using just the title and text.');
        content = `
            Title: ${title}  
            Text: ${body}
            `;
        try {
            completion = await tryCompletion(content);
        } catch (error) {
            console.error(error.message);
            if (error.code === 'context_length_exceeded') {
                console.log('Context length exceeded. Using just the title.');
                content = `
                    Title: ${title}  
                    `;
                completion = await tryCompletion(content);
            }
        }
    } else {
        console.error('Error generating completion:', error);
    }
}

if (completion) {
    console.log(completion.choices[0].message);
}