import React, { useState } from 'react';
import { Question } from '../types';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface QuizProps {
  questions: Question[];
  onComplete: () => void;
  onLessonPassed?: () => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onComplete, onLessonPassed }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  // State to track interaction for the current question
  const [wrongIndices, setWrongIndices] = useState<number[]>([]);
  const [isSolved, setIsSolved] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (index: number) => {
    // Prevent interaction if already solved or if this option was already marked wrong
    if (isSolved || wrongIndices.includes(index)) return;

    if (index === currentQuestion.correct_option_index) {
      // Correct answer logic
      setIsSolved(true);
      // Only increase score if no wrong attempts were made yet (first try)
      if (wrongIndices.length === 0) {
        setScore((prev) => prev + 1);
      }
    } else {
      // Incorrect answer logic
      setWrongIndices((prev) => [...prev, index]);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      // Reset state for next question
      setWrongIndices([]);
      setIsSolved(false);
    } else {
      // Finish the quiz by moving index past the last question
      setCurrentIndex((prev) => prev + 1);
      onComplete();
      // If score is reasonable (e.g. > 50% or just completed), mark as passed. 
      // Since we force correct answers, completion equals passing.
      if (onLessonPassed) {
        onLessonPassed();
      }
    }
  };

  if (!currentQuestion) {
    // Result Screen
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Gefeliciteerd!</h2>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-400">
          Vraag {currentIndex + 1} van {questions.length}
        </h3>
        <span className="text-sm font-semibold bg-gray-100 px-3 py-1 rounded-full text-gray-600">
          Score: {score}
        </span>
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
        {currentQuestion.question_text}
      </h2>

      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, index) => {
          let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium ";
          const isWrong = wrongIndices.includes(index);
          const isCorrectAnswer = index === currentQuestion.correct_option_index;
          
          if (isSolved && isCorrectAnswer) {
             // Show green only when solved and it is the correct answer
             btnClass += "border-green-500 bg-green-50 text-green-700";
          } else if (isWrong) {
             // Show red if user clicked this and it was wrong
             btnClass += "border-red-500 bg-red-50 text-red-700 opacity-60 cursor-not-allowed";
          } else if (isSolved) {
             // If solved, dim other unchecked options
             btnClass += "border-gray-100 text-gray-400 opacity-50";
          } else {
             // Default state
             btnClass += "border-gray-200 hover:border-dutch-blue hover:bg-blue-50 text-gray-700";
          }

          return (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={isSolved || isWrong}
              className={btnClass}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {isSolved && isCorrectAnswer && <CheckCircle size={20} className="text-green-500" />}
                {isWrong && <XCircle size={20} className="text-red-500" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback Area */}
      {(isSolved || wrongIndices.length > 0) && (
        <div className={`p-4 rounded-lg mb-6 animate-fade-in ${isSolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <p className="font-bold mb-1">
            {isSolved ? 'Correct!' : 'Niet helemaal goed...'}
          </p>
          <p>
            {isSolved 
              ? currentQuestion.feedback.correct 
              : currentQuestion.feedback.incorrect // Always show incorrect feedback if not solved yet
            }
          </p>
        </div>
      )}

      {/* Next Button only appears when solved */}
      {isSolved && (
        <div className="flex justify-center animate-fade-in">
          <button
            onClick={handleNext}
            className="bg-dutch-orange text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition flex items-center shadow-md hover:shadow-lg"
          >
            {currentIndex === questions.length - 1 ? 'Afronden' : 'Volgende Vraag'}
            <ArrowRight size={20} className="ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;