// 환경변수 GROQ_KEY를 사용하여 API 키를 가져옵니다.
const API_KEY = process.env.GROQ_KEY; 

// Groq API 엔드포인트
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');

// 대화 내역을 기억하기 위한 배열 (Context 유지)
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

    // API 키가 없는 경우 에러 처리
    if (!API_KEY) {
        appendMessage("에러: GROQ_KEY 환경변수가 설정되지 않았습니다.", 'ai-message');
        return;
    }

    // 2. 로딩 표시를 위한 임시 메시지 생성
    const loadingMessageDiv = appendMessage("생각 중...", 'ai-message');

    try {
        // 3. Groq API 호출
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama3-8b-8192", // Groq 추천 기본 모델
                messages: messageHistory,
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            throw new Error(`API 오류: ${response.status}`);
        }

        const data = await response.json();
        const aiResponseText = data.choices[0].message.content;

        // 4. 로딩 메시지를 실제 AI 답변으로 변경
        loadingMessageDiv.innerText = aiResponseText;
        
        // 5. AI 답변도 대화 내역에 누적
        messageHistory.push({ role: "assistant", content: aiResponseText });

    } catch (error) {
        console.error("Groq API Error:", error);
        loadingMessageDiv.innerText = "답변을 가져오는 중 오류가 발생했습니다.";
    }

    // 스크롤을 맨 아래로 이동
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 화면에 메시지 말풍선을 추가하는 함수
function appendMessage(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', className);
    messageDiv.innerText = text;
    chatMessages.appendChild(messageDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv; // 로딩 텍스트 수정을 위해 요소 반환
}

// 엔터키 제어
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}
