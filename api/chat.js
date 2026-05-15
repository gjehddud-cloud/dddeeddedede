// 환경 변수 설정 방식에 따라 아래 코드를 수정하세요.
// 1. Vite 등 빌드 도구를 쓴다면: const API_KEY = import.meta.env.VITE_GROQ_KEY;
// 2. 로컬 테스트용(주의: 배포 시 유출 위험): const API_KEY = "gsk_여러분들의_실제_GROQ_API_키";
const API_KEY = process.env.GROQ_KEY || "여기에_GROQ_키를_넣어주세요"; // Node/빌드 환경 가정

// Groq API 엔드포인트 (OpenAI와 구조가 같습니다)
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');

// 대화 맥락(기록)을 저장할 배열
let messageHistory = [
    { role: "system", content: "당신은 친절하고 도움이 되는 AI 어시스턴트입니다. 한국어로 답변해주세요." }
];

async function sendMessage() {
    const messageText = userInput.value.trim();
    if (messageText === "") return;

    // 1. 사용자 메시지 화면에 추가 및 기록
    appendMessage(messageText, 'user-message');
    messageHistory.push({ role: "user", content: messageText });
    userInput.value = "";

    // 2. 로딩 표시를 위한 임시 메시지 추가
    const loadingMessageDiv = appendMessage("답변을 생성하는 중입니다...", 'ai-message');

    try {
        // 3. Groq API 호출
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama3-8b-8192", // Groq에서 지원하는 빠르고 가벼운 모델
                messages: messageHistory,
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status}`);
        }

        const data = await response.json();
        const aiResponseText = data.choices[0].message.content;

        // 4. 로딩 메시지를 실제 AI 답변으로 교체
        loadingMessageDiv.innerText = aiResponseText;
        
        // 5. AI 답변을 대화 기록에 추가 (다음 질문의 맥락을 위해)
        messageHistory.push({ role: "assistant", content: aiResponseText });

    } catch (error) {
        console.error("Error:", error);
        loadingMessageDiv.innerText = "API 호출 중 오류가 발생했습니다. 키가 올바른지 확인해주세요.";
    }

    // 스크롤 아래로 고정
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 화면에 말풍선을 그려주는 함수 (수정됨: 생성된 요소를 반환하여 나중에 텍스트를 바꿀 수 있게 함)
function appendMessage(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', className);
    messageDiv.innerText = text;
    chatMessages.appendChild(messageDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv; // 로딩 메시지를 업데이트하기 위해 반환
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}
