const axios = require('axios');

// config 
const apiKey = "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";
const maxTokens = 500;
const numberGenerateImage = 1;
const maxStorageMessage = 4;

if (!global.temp.openAIUsing)
  global.temp.openAIUsing = {};
if (!global.temp.openAIHistory)
  global.temp.openAIHistory = {};

const { openAIUsing, openAIHistory } = global.temp;

module.exports = {
  config: {
    name: "gpt",
    version: "1.2",
    author: "Ntkhang",
    countDown: 5,
    role: 0,
    description: {
      en: "Chatgpt 3.5"
    },
    category: "ai",
    guide: {
      en: "   {pn} <draw> <content> - create image from content"
        + "\n   {pn} <clear> - clear chat history with gpt"
        + "\n   {pn} <content> - chat with gpt"
    }
  },

  langs: {
    en: {
      apiKeyEmpty: "Please provide api key for openai at file scripts/cmds/gpt.js",
      invalidContentDraw: "Please enter the content you want to draw",
      yourAreUsing: "You are using gpt chat, please wait until the previous request ends",
      processingRequest: "Processing your request, this process may take a few minutes, please wait",
      invalidContent: "Please enter the content you want to chat",
      error: "An error has occurred\n%1",
      clearHistory: "Your chat history with gpt has been deleted"
    }
  },

  onStart: async function ({ message, event, args, getLang, prefix, commandName }) {
    if (!apiKey)
      return message.reply(getLang('apiKeyEmpty', prefix));

    switch (args[0]) {
      case 'img':
      case 'image':
      case 'draw': {
        if (!args[1])
          return message.reply(getLang('invalidContentDraw'));
        if (openAIUsing[event.senderID])
          return message.reply(getLang("yourAreUsing"));

        openAIUsing[event.senderID] = true;

        let sending;
        try {
          sending = message.reply(getLang('processingRequest'));
          const responseImage = await axios({
            url: "https://api.openai.com/v1/images/generations",
            method: "POST",
            headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
            },
            data: {
              prompt: args.slice(1).join(' '),
              n: numberGenerateImage,
              size: '1024x1024'
            }
          });
          const imageUrls = responseImage.data.data;
          const images = await Promise.all(imageUrls.map(async (item) => {
            const image = await axios.get(item.url, {
              responseType: 'stream'
            });
            image.data.path = `${Date.now()}.png`;
            return image.data;
          }));
          return message.reply({
            attachment: images
          });
        }
        catch (err) {
          const errorMessage = err.response?.data.error.message || err.message;
          return message.reply(getLang('error', errorMessage || ''));
        }
        finally {
          delete openAIUsing[event.senderID];
          message.unsend((await sending).messageID);
        }
      }
      case 'clear': {
        openAIHistory[event.senderID] = [];
        return message.reply(getLang('clearHistory'));
      }
      default: {
        if (!args[1])
          return message.reply(getLang('invalidContent'));

        handleGpt(event, message, args, getLang, commandName);
      }
    }
  },

  onReply: async function ({ Reply, message, event, args, getLang, commandName }) {
    const { author } = Reply;
    if (author != event.senderID)
      return;

    handleGpt(event, message, args, getLang, commandName);
  }
};

async function askGpt(event) {
  const response = await axios({
    url: "https://api.openai.com/v1/chat/completions",
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    data: {
      model: "gpt-3.5-turbo",
      messages: openAIHistory[event.senderID],
      max_tokens: maxTokens,
      temperature: 0.7
    }
  });
  return response;
}

async function handleGpt(event, message, args, getLang, commandName) {
  try {
    openAIUsing[event.senderID] = true;

    if (
      !openAIHistory[event.senderID] ||
      !Array.isArray(openAIHistory[event.senderID])
    )
      openAIHistory[event.senderID] = [];

    if (openAIHistory[event.senderID].length >= maxStorageMessage)
      openAIHistory[event.senderID].shift();

    openAIHistory[event.senderID].push({
      role: 'user',
      content: args.join(' ')
    });

    const response = await askGpt(event);
    const text = response.data.choices[0].message.content;

    openAIHistory[event.senderID].push({
      role: 'assistant',
      content: text
    });

    return message.reply(text, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        author: event.senderID,
        messageID: info.messageID
      });
    });
  }
  catch (err) {
    const errorMessage = err.response?.data.error.message || err.message || "";
    return message.reply(getLang('error', errorMessage));
  }
  finally {
    delete openAIUsing[event.senderID];
  }
      }
