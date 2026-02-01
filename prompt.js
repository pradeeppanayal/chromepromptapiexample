let session;
let waitingForResponse = false;

async function initModel() {
    if (!self.LanguageModel) {
        alert("Chrome Prompt API not available");
        return;
    }

    const availability = await self.LanguageModel.availability({
        expectedInputs: [{ type: "text" }]
    });

    if (availability === "unavailable") {
        alert("AI model is unavailable");
        return;
    }

    session = await self.LanguageModel.create({
        systemPrompt: "You are a helpful assistant.",
        outputLanguage: "en"
    });
}

async function sendPrompt() {
    if (waitingForResponse) return;

    const input = document.getElementById("promptInput");
    const sendBtn = document.getElementById("sendBtn");
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    waitingForResponse = true;
    input.disabled = true;
    sendBtn.disabled = true;

    removeTypingIndicator();
    showTypingIndicator();

    try {
        if (!session) {
            await initModel();
        }

        const response = await session.prompt(text);

        removeTypingIndicator();
        addMessage(response, "ai");

    } catch (err) {
        removeTypingIndicator();
        addMessage("Something went wrong. Please try again.", "ai");
        console.error(err);

    } finally {
        waitingForResponse = false;
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    }
}

function addMessage(text, type) {
    const chat = document.getElementById("chat");
    const div = document.createElement("div");
    div.className = `message ${type}`;
    div.innerHTML = formatMessage(text);
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function formatMessage(text) {
    const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    return escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

// Send on Enter key
document.getElementById("promptInput").addEventListener("keydown", e => {
    if (e.key === "Enter") sendPrompt();
});

function showTypingIndicator() {
    const chat = document.getElementById("chat");
    const div = document.createElement("div");
    div.className = "message ai";
    div.id = "typingIndicator";
    div.innerHTML = `
    <div class="typing">
      <span></span><span></span><span></span>
    </div>
  `;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function removeTypingIndicator() {
    const typing = document.getElementById("typingIndicator");
    if (typing) typing.remove();
}
