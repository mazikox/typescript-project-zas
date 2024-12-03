import { Question, Test } from "./data/data.js";
import data from "./data/test-data.js";

const startButton = document.getElementById("start") as HTMLButtonElement;
const backButton = document.getElementById("back") as HTMLButtonElement;
const nextButton = document.getElementById("next") as HTMLButtonElement;
const endButton = document.getElementById("end") as HTMLButtonElement;
const homeButton = document.getElementById("home") as HTMLButtonElement;
const questionElement = document.getElementById("question") as HTMLElement;
const answersElement = document.getElementById("answers") as HTMLElement;
const navigationButtons = document.getElementById("navigation") as HTMLElement;
const totalTimeElement = document.getElementById("total-time") as HTMLElement;
const questionTimeElement = document.getElementById("question-time") as HTMLElement;

let currentQuestionIndex = 0;
const questions: Question[] = shuffleArray(data.questions);

let testTimer: number | undefined;
let elapsedTime = 0;

let questionTimer: number | undefined;
let questionElapsedTime = 0;

function initialize() {
    questionElement.style.display = "none";
    answersElement.style.display = "none";
    navigationButtons.style.display = "none";
    startButton.style.display = "block";
    totalTimeElement.textContent = "0 sekund";
    questionTimeElement.textContent = "0 sekund";
    endButton.disabled = !checkAllAnswersSaved();
}

function updateButtons() {
    backButton.disabled = currentQuestionIndex === 0;
    nextButton.disabled = currentQuestionIndex === questions.length - 1;
}

function saveAnswerResult(questionIndex: number, isCorrect: boolean) {
    const key = "results";
    const results = JSON.parse(localStorage.getItem(key) || "[]");
    results[questionIndex] = isCorrect;
    localStorage.setItem(key, JSON.stringify(results));
}

function saveQuestionTime(questionIndex: number, timeSpent: number) {
    const key = "questionTimes";
    const times = JSON.parse(localStorage.getItem(key) || "[]");
    times[questionIndex] = timeSpent;
    localStorage.setItem(key, JSON.stringify(times));
}

function loadSavedQuestionTime(questionIndex: number): number {
    const key = "questionTimes";
    const times = JSON.parse(localStorage.getItem(key) || "[]");
    return times[questionIndex] || 0;
}

function startTestTimer() {
    elapsedTime = 0;
    testTimer = window.setInterval(() => {
        elapsedTime++;
        totalTimeElement.textContent = elapsedTime.toString() + " sekund";
    }, 1000);
}

function stopTestTimer() {
    if (testTimer !== undefined) {
        clearInterval(testTimer);
    }
}

function startQuestionTimer() {
    questionElapsedTime = loadSavedQuestionTime(currentQuestionIndex);
    questionTimer = window.setInterval(() => {
        questionElapsedTime++;
        questionTimeElement.textContent = questionElapsedTime.toString() + " sekund";
    }, 1000);
}

function stopQuestionTimer() {
    if (questionTimer !== undefined) {
        clearInterval(questionTimer);
        saveQuestionTime(currentQuestionIndex, questionElapsedTime);
    }
}

function switchQuestion(newIndex: number) {
    stopQuestionTimer();
    saveQuestionTime(currentQuestionIndex, questionElapsedTime);
    currentQuestionIndex = newIndex;
    loadQuestion();
}

function loadQuestion() {
    const question = questions[currentQuestionIndex];
    questionElement.style.display = "inline";
    answersElement.style.display = "block";
    navigationButtons.style.display = "flex";
    startButton.style.display = "none";

    questionElement.innerHTML = `Pytanie ${currentQuestionIndex + 1} z ${questions.length} <br/> ${question.question}`;
    answersElement.innerHTML = "";
    question.answers.forEach(answer => {
        const answerButton = document.createElement("button");
        answerButton.textContent = answer.content;
        answerButton.onclick = () => {
            const isCorrect = answer.content === question.correctAnswer;
            saveAnswerResult(currentQuestionIndex, isCorrect);
            endButton.disabled = !checkAllAnswersSaved();
        };
        answersElement.appendChild(answerButton);
    });

    questionElapsedTime = loadSavedQuestionTime(currentQuestionIndex);
    questionTimeElement.textContent = questionElapsedTime.toString() + " sekund";
    updateButtons();
    startQuestionTimer();
}

function checkAllAnswersSaved(): boolean {
    const results = JSON.parse(localStorage.getItem("results") || "[]");
    return results.length === questions.length && results.every((result: boolean) => result !== undefined);
}

function updateEndButtonState() {
    
}

function findIndexWithMaxTime(questionTimes: number[]): number {
    if (questionTimes.length === 0) {
        return -1;
    }

    let maxTime = questionTimes[0];
    let maxIndex = 0;

    for (let i = 1; i < questionTimes.length; i++) {
        if (questionTimes[i] > maxTime) {
            maxTime = questionTimes[i];
            maxIndex = i;
        }
    }

    return maxIndex;
}


backButton.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
        switchQuestion(currentQuestionIndex - 1);
    }
});

nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length - 1) {
        switchQuestion(currentQuestionIndex + 1);
    }
});

endButton.addEventListener("click", () => {
    stopTestTimer();
    stopQuestionTimer();
    initialize();

    const results = JSON.parse(localStorage.getItem("results") || "[]");
    const questionTimes = JSON.parse(localStorage.getItem("questionTimes") || "[]");


    const correctAnswers = results.filter((result: boolean) => result).length;
    const totalQuestions = questions.length;
    const averageTime = questionTimes.reduce((sum: number, time: number) => sum + time, 0) / totalQuestions;


    const statsElement = document.getElementById("stats") as HTMLElement;
    statsElement.innerHTML = `
        <h3>Statystyki testu</h3>
        <p>Łączny czas: ${elapsedTime} sekund</p>
        <p>Poprawne odpowiedzi: ${correctAnswers} z ${totalQuestions}</p>
        <p>Średni czas na pytanie: ${averageTime.toFixed(2)} sekund</p>
        <p>Najwięcej spędzonego czasu na pytaniu nr ${findIndexWithMaxTime(questionTimes) + 1} </p>
    `;
});


startButton.addEventListener("click", () => {
    startTestTimer();
    loadQuestion();
});

homeButton.addEventListener("click", () => {
    initialize();
    elapsedTime = 0;
    stopQuestionTimer();
    stopTestTimer();
})

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

initialize();
