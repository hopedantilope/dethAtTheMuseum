// ===========================
// Quiz Page Functionality
// ===========================

(function() {
  const quizData = [
    {
      question: "Can you donate your body to science and medical research?",
      options: [
        "Yes, it is possible to sign up using a form at NTNU",
        "No, it is not usually possible",
        "No, it is not allowed for ethical reasons"
      ],
      correct: 0
    },
    {
      question: "How were the organs in the exhibition prepared?",
      options: [
        "The organs are fake and only very well recreated to resemble real human organs",
        "The organs are from real humans and were prepared using methods including wet specimens, corrosion casting, and plastination",
        "The organs are from real humans and are displayed without any preparation"
      ],
      correct: 1
    },
    {
      question: "Can you find a preserved fetus in the exhibition?",
      options: [
        "No, there is not",
        "Yes, there is",
        "No, there is not, but it should be part of the exhibition in the future"
      ],
      correct: 1
    },
    {
      question: "The heart is connected to which circulation systems?",
      options: [
        "Only one circulation system – the systemic circulation",
        "The brain circulation and pulmonary circulation",
        "The systemic circulation and pulmonary circulation"
      ],
      correct: 2
    },
    {
      question: "What is the leading cause of death globally?",
      options: [
        "Cardiovascular diseases, including heart attacks and strokes",
        "Cancer",
        "Bacterial infections"
      ],
      correct: 0
    },
    {
      question: "Who was the first person to perform the coronary casting method?",
      options: [
        "Leonardo da Vinci",
        "An unknown doctor",
        "Professors at NTNU"
      ],
      correct: 0
    },
    {
      question: "How can you reduce the risk of cardiovascular disease?",
      options: [
        "Not using tobacco, avoiding harmful alcohol consumption, reducing salt intake, eating more fruits and vegetables, and maintaining regular physical activity",
        "Eating large amounts of fatty meat",
        "Eating pizza every day for dinner"
      ],
      correct: 0
    },
    {
      question: "The donors of the organs in this exhibition come from which part of the world?",
      options: [
        "Norway – Trøndelag",
        "The USA",
        "Asia"
      ],
      correct: 0
    }
  ];
  
  let currentQuestion = 0;
  let selectedAnswers = [];
  let score = 0;
  let quizCompleted = false;
  
  function init() {
    const quizContainer = document.getElementById('quiz');
    if (!quizContainer) return;
    
    // Initialize selected answers array
    selectedAnswers = new Array(quizData.length).fill(null);
    
    renderQuiz();
    
    // Re-render when page becomes active
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class' && quizContainer.classList.contains('active')) {
          renderQuiz();
        }
      });
    });
    observer.observe(quizContainer, { attributes: true, attributeFilter: ['class'] });
  }
  
  function renderQuiz() {
    const quizContainer = document.getElementById('quiz');
    if (!quizContainer) return;
    
    if (quizCompleted) {
      renderResults();
      return;
    }
    
    const question = quizData[currentQuestion];
    
    quizContainer.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-background">
        </div>
        
        <div class="quiz-left">

          <div class="quiz-image">
            <img src="images/scan-head.png" alt="Anatomical scan" />
          </div>
        </div>
        
        <div class="quiz-right">
          <div class="quiz-progress">
            <div class="quiz-progress-bar">
              <div class="quiz-progress-fill" style="width: ${((currentQuestion + 1) / quizData.length) * 100}%"></div>
            </div>
            <div class="quiz-progress-text">${currentQuestion + 1} of ${quizData.length}</div>
          </div>
          
          <div class="quiz-question-container">
            <div class="quiz-question-number">Question ${currentQuestion + 1}</div>
            <div class="quiz-question-text">${question.question}</div>
            
            <div class="quiz-options">
              ${question.options.map((option, index) => `
                <div class="quiz-option ${selectedAnswers[currentQuestion] === index ? 'selected' : ''}" data-index="${index}">
                  <div class="quiz-option-radio"></div>
                  <div class="quiz-option-text">${option}</div>
                </div>
              `).join('')}
            </div>
            
            <div class="quiz-nav">
              ${currentQuestion > 0 ? `
                <button class="quiz-nav-btn prev-btn" onclick="quizPrev()">
                  <span class="arrow">→</span>
                  Previous
                </button>
              ` : ''}
              <button class="quiz-nav-btn next-btn" onclick="quizNext()" ${selectedAnswers[currentQuestion] === null ? 'disabled' : ''}>
                ${currentQuestion === quizData.length - 1 ? 'Finish Quiz' : 'Next Question'}
                <span class="arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add click handlers to options
    const options = quizContainer.querySelectorAll('.quiz-option');
    options.forEach(option => {
      option.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        selectAnswer(index);
      });
    });
  }
  
  function selectAnswer(index) {
    selectedAnswers[currentQuestion] = index;
    renderQuiz();
  }
  
  function quizNext() {
    if (selectedAnswers[currentQuestion] === null) return;
    
    if (currentQuestion < quizData.length - 1) {
      currentQuestion++;
      renderQuiz();
    } else {
      // Calculate score
      score = 0;
      selectedAnswers.forEach((answer, index) => {
        if (answer === quizData[index].correct) {
          score++;
        }
      });
      quizCompleted = true;
      renderResults();
    }
  }
  
  function quizPrev() {
    if (currentQuestion > 0) {
      currentQuestion--;
      renderQuiz();
    }
  }
  
  function renderResults() {
    const quizContainer = document.getElementById('quiz');
    if (!quizContainer) return;
    
    const percentage = Math.round((score / quizData.length) * 100);
    let message = '';
    
    if (percentage === 100) {
      message = 'Perfect! You really know your anatomy!';
    } else if (percentage >= 75) {
      message = 'Great job! You have excellent knowledge!';
    } else if (percentage >= 50) {
      message = 'Good effort! Keep learning!';
    } else {
      message = 'Keep exploring the exhibition to learn more!';
    }
    
    quizContainer.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-background">
        </div>
        
        <div class="quiz-left">          
          <div class="quiz-image">
            <img src="images/scan-head.png" alt="Anatomical scan" />
          </div>
        </div>
        
        <div class="quiz-right">
          <div class="quiz-results">
            <div class="quiz-results-title">Quiz Complete!</div>
            <div class="quiz-results-score">${score}/${quizData.length}</div>
            <div class="quiz-results-text">${message}</div>
            <button class="quiz-restart-btn" onclick="showPage('home')">
              Back to home
              <span class="arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }
  
  function quizRestart() {
    currentQuestion = 0;
    selectedAnswers = new Array(quizData.length).fill(null);
    score = 0;
    quizCompleted = false;
    renderQuiz();
  }
  
  // Expose functions globally
  window.quizNext = quizNext;
  window.quizPrev = quizPrev;
  window.quizRestart = quizRestart;
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();