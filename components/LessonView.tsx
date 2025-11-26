import React, { useState, useEffect } from 'react';
import { LessonData } from '../types';
import Quiz from './Quiz';
import AiTutor from './AiTutor';
import { ArrowLeft, Volume2, StopCircle, Lightbulb } from 'lucide-react';

interface LessonViewProps {
  lesson: LessonData;
  onBack: () => void;
  onComplete?: (lessonId: string) => void;
}

const LessonView: React.FC<LessonViewProps> = ({ lesson, onBack, onComplete }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Setup Speech Synthesis
  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(lesson.text_content.title + ". " + lesson.text_content.body);
    utterance.lang = 'nl-NL';
    utterance.rate = 0.9; // Slightly slower for learners
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleLessonPassed = () => {
     if (onComplete) {
       onComplete(lesson.id);
     }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <button
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-dutch-blue mb-6 transition font-semibold"
      >
        <ArrowLeft size={20} className="mr-2" />
        Terug naar overzicht
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Text */}
        <div className="space-y-6">
          
          {/* LCPP Context Section - Activates Prior Knowledge */}
          {lesson.context_questions && lesson.context_questions.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-r-xl shadow-sm animate-fade-in">
              <div className="flex items-start mb-3">
                <Lightbulb className="text-yellow-600 mr-2 flex-shrink-0" size={24} />
                <h3 className="text-lg font-bold text-yellow-800">Voorbereiding</h3>
              </div>
              <p className="text-sm text-yellow-700 mb-3 italic">
                Denk na over deze vragen voordat je de tekst leest. Dit helpt je om de tekst beter te begrijpen.
              </p>
              <ul className="space-y-2">
                {lesson.context_questions.map((q, index) => (
                  <li key={index} className="flex items-start text-yellow-900 font-medium">
                    <span className="mr-2">•</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={`rounded-2xl shadow-lg overflow-hidden border ${lesson.isGenerated ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-100'}`}>
             <div className={`${lesson.isGenerated ? 'bg-amber-500' : 'bg-dutch-blue'} p-6 text-white`}>
                <div className="flex justify-between items-start">
                  <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                    {lesson.meta.theme}
                  </span>
                  {lesson.isGenerated && (
                    <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                      ⭐ Challenge
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold">{lesson.text_content.title}</h1>
             </div>
             
             <div className="p-8 bg-white">
                <p className="text-lg md:text-xl leading-relaxed text-gray-700 font-medium font-sans">
                  {lesson.text_content.body}
                </p>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSpeak}
                    className={`flex items-center px-4 py-2 rounded-full font-bold transition shadow-sm ${
                      isSpeaking 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-blue-50 text-dutch-blue hover:bg-blue-100'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <StopCircle size={20} className="mr-2" /> Stop
                      </>
                    ) : (
                      <>
                        <Volume2 size={20} className="mr-2" /> Luister
                      </>
                    )}
                  </button>
                </div>
             </div>
          </div>

          <div className="bg-orange-50 rounded-xl p-6 border border-orange-100 text-dutch-orange text-sm">
             <h4 className="font-bold mb-2 flex items-center">
               <span className="text-xl mr-2">💡</span> Tip
             </h4>
             <p>Lees de tekst eerst rustig door. Luister daarna naar de uitspraak. Maak pas daarna de vragen.</p>
          </div>
        </div>

        {/* Right Column: Quiz */}
        <div className="lg:h-full">
           <Quiz 
             questions={lesson.questions} 
             onComplete={() => setQuizCompleted(true)} 
             onLessonPassed={handleLessonPassed}
           />
        </div>
      </div>

      {/* AI Tutor Floating Widget */}
      <AiTutor 
        contextTitle={lesson.text_content.title} 
        contextText={lesson.text_content.body} 
      />
    </div>
  );
};

export default LessonView;