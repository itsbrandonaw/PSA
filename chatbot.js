const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");
const chatbotToggler = document.querySelector(".chatbot-toggler");
const chatbotCloseBtn = document.querySelector(".close-btn");

let userMessage;
const API_KEY = "AIzaSyDHGii1Imzay4U6nnPR9aTZFRVbTslPI58";
const inputInitHeight = chatInput.scrollHeight;

// Store conversation history
let conversationHistory = []; 

let knowledgeBase = {
    "what is your name": "I am Potty, the chatbot for PSA Singapore!",
    "what is your purpose": "I am here to assist you with any queries you may have about PSA Singapore.",
    "what is PSA": "PSA Singapore is a leading global port group and a trusted partner to cargo stakeholders worldwide.",
    "where is PSA": "PSA Singapore is located in Singapore, a small island city-state in Southeast Asia.",
    "what is the address of PSA": "PSA Singapore is located at 460 Alexandra Road, Singapore 119963.",
    "what is the contact number of PSA": "You can contact PSA Singapore at +65 6274 7111.",
    "what are the services provided by PSA": "PSA Singapore provides a wide range of services including container handling, cargo logistics, and port management.",
    "what types of roles are available at PSA": "PSA Singapore offers a variety of roles in areas such as operations, engineering, IT, and management.",

};

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
};

const generateResponse = (incomingChatLi) => {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
    const messageElement = incomingChatLi.querySelector("p");

    const findRelevantInfo = (userMessage, knowledgeBase) => {
        // 1. Preprocess userMessage (lowercase, remove punctuation, etc.)
        const processedMessage = userMessage.toLowerCase().replace(/[.,!?;]/g, '');
      
        // 2. Extract keywords from processedMessage
        const keywords = processedMessage.split(' '); 
      
        // 3.  Search knowledgeBase for matching keywords
        let relevantInfo = "";
        for (const question in knowledgeBase) {
          if (keywords.some(keyword => question.toLowerCase().includes(keyword))) {
            relevantInfo = knowledgeBase[question];
            break; // Stop at the first match (or you can collect multiple matches)
          }
        }
      
        // 4.  Return relevant info (or a default message if no match)
        if (relevantInfo) {
          return relevantInfo;
        } else {
          return "I couldn't find information on that. Can you rephrase your query?";
        }
      } 

    // Prepare request body
    let requestBody = {
        "contents": [{
            "role": "user",
            "parts": [{ text: userMessage }]
        }]
    };

    // Include conversation history in the request
    //if (conversationHistory.length > 0) {
    //    requestBody.context = conversationHistory;
    //} else 
    if (knowledgeBase) { // Or, if using an external knowledge base
        const relevantInfo = findRelevantInfo(userMessage, knowledgeBase);
        if (relevantInfo) {
            requestBody.context = [{ role: "system", content: relevantInfo }];
        }
    }

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
    };

    console.log(requestOptions.body);

    fetch(API_URL, requestOptions)
        .then(res => res.json())
        .then(data => {
            const responseText = data.candidates[0].content.parts[0].text;
            messageElement.textContent = responseText;

            // Add user message and API response to conversation history
            //conversationHistory.push({ role: "user", content: userMessage });
            //conversationHistory.push({ role: "assistant", content: responseText });
        })
        .catch(error => {
            messageElement.classList.add("error");
            messageElement.textContent = "Oops! Something went wrong. Please try again.";
        }).finally(() => {
            chatbox.scrollTo(0, chatbox.scrollHeight);
        });
}

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) {
        return;
    }
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
};

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
chatbotCloseBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));