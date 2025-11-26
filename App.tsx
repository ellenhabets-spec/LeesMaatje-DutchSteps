import React, { useState, useEffect } from 'react';
import { LESSONS_A1, LESSONS_A2, LESSONS_B1 } from './constants';
import { LessonData, ScreenState } from './types';
import LessonCard from './components/LessonCard';
import LessonView from './components/LessonView';
import { BookOpen, Trophy, Sparkles, Loader2 } from 'lucide-react';
import { generateBridgeLesson } from './services/geminiService';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('DASHBOARD');
  const [currentLevel, setCurrentLevel] = useState<'A1' | 'A2' | 'B1'>('A1');
  const [selectedLesson, setSelectedLesson] = useState<LessonData | null>(null);
  
  // Track completed lesson IDs
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('dutchsteps_completed');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Store generated generated bridge lessons
  const [generatedLessons, setGeneratedLessons] = useState<LessonData[]>([]);

  const [isGenerating, setIsGenerating] = useState<number | null>(null); // difficulty level being generated

  useEffect(() => {
    localStorage.setItem('dutchsteps_completed', JSON.stringify(Array.from(completedLessonIds)));
  }, [completedLessonIds]);

  const handleLessonSelect = (lesson: LessonData) => {
    setSelectedLesson(lesson);
    setCurrentScreen('LESSON');
    window.scrollTo(0, 0);
  };

  const handleBackToDashboard = () => {
    setSelectedLesson(null);
    setCurrentScreen('DASHBOARD');
  };

  const handleLessonComplete = (lessonId: string) => {
    setCompletedLessonIds(prev => {
      const newSet = new Set(prev);
      newSet.add(lessonId);
      return newSet;
    });
  };

  const handleLevelChange = (level: 'A1' | 'A2' | 'B1') => {
    setCurrentLevel(level);
    handleBackToDashboard();
  };

  // Determine which lessons to show based on level selection
  let baseLessons: LessonData[] = [];
  if (currentLevel === 'A1') baseLessons = LESSONS_A1;
  else if (currentLevel === 'A2') baseLessons = LESSONS_A2;
  else baseLessons = LESSONS_B1;

  const currentGeneratedLessons = generatedLessons.filter(l => l.meta.level_erk.startsWith(currentLevel));
  const allLessons = [...baseLessons, ...currentGeneratedLessons];

  // Helper to calculate stats per difficulty
  const getStatsForDifficulty = (diff: number) => {
    const difficultyLessons = baseLessons.filter(l => l.meta.difficulty === diff);
    const completedCount = difficultyLessons.filter(l => completedLessonIds.has(l.id)).length;
    const total = difficultyLessons.length;
    
    return { completedCount, total, isFull: total > 0 && completedCount === total };
  };

  const handleGenerateBridge = async (difficulty: number) => {
    setIsGenerating(difficulty);
    
    // Gather themes from the completed lessons of this difficulty
    const themes = baseLessons
      .filter(l => l.meta.difficulty === difficulty)
      .map(l => l.meta.theme);
    
    const newLesson = await generateBridgeLesson(difficulty, themes, currentLevel);
    
    setIsGenerating(null);
    
    if (newLesson) {
      setGeneratedLessons(prev => [...prev, newLesson]);
      handleLessonSelect(newLesson);
    } else {
      alert("Het genereren van de les is niet gelukt. Probeer het later opnieuw.");
    }
  };

  const renderDifficultySection = (difficulty: number) => {
    const { completedCount, total, isFull } = getStatsForDifficulty(difficulty);
    const difficultyLessons = allLessons.filter(l => l.meta.difficulty === difficulty);
    
    if (difficultyLessons.length === 0) return null;

    return (
      <div key={difficulty} className="mb-12 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
              {difficulty}
            </span>
            Niveau {difficulty}
          </h3>
          <div className="text-sm font-semibold text-gray-500">
            {completedCount} / {total} Voltooid
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-dutch-blue h-2.5 rounded-full transition-all duration-500" 
            style={{ width: total > 0 ? `${Math.min((completedCount / total) * 100, 100)}%` : '0%' }}
          ></div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {difficultyLessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onClick={handleLessonSelect}
              isCompleted={completedLessonIds.has(lesson.id)}
            />
          ))}
        </div>

        {/* Bridge Generator Button */}
        {isFull && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm">
             <div className="mb-4 md:mb-0">
               <h4 className="text-lg font-bold text-amber-800 flex items-center">
                 <Trophy className="mr-2 text-amber-600" />
                 Niveau {difficulty} Voltooid!
               </h4>
               <p className="text-amber-700 text-sm">
                 Je hebt alle basisteksten van dit niveau gelezen. Klaar voor een extra uitdaging?
               </p>
             </div>
             <button
               onClick={() => handleGenerateBridge(difficulty)}
               disabled={isGenerating === difficulty}
               className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-bold shadow-md transition transform hover:scale-105 flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {isGenerating === difficulty ? (
                 <>
                   <Loader2 className="animate-spin mr-2" /> Genereren...
                 </>
               ) : (
                 <>
                   <Sparkles className="mr-2" /> Genereer Finale-Les
                 </>
               )}
             </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">
      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-dutch-blue cursor-pointer" onClick={handleBackToDashboard}>
            <div className="bg-dutch-orange p-2 rounded-lg text-white">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">DutchSteps</h1>
              <p className="text-xs text-gray-500 font-semibold tracking-wide">NT2 TRAINING</p>
            </div>
          </div>
          
          {/* Level Switcher in Navbar */}
           <div className="flex items-center gap-3">
             <div className="hidden md:block text-right mr-2">
                <p className="text-xs font-bold text-gray-500 uppercase">Niveau</p>
             </div>
             <div className="flex items-center gap-2">
               {(['A1', 'A2', 'B1'] as const).map((level) => (
                 <button
                   key={level}
                   onClick={() => handleLevelChange(level)}
                   className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border-2 transition-all duration-200 ${
                     currentLevel === level
                       ? 'bg-dutch-orange text-white border-dutch-orange scale-105'
                       : 'bg-white text-gray-400 border-gray-100 hover:border-dutch-orange hover:text-dutch-orange'
                   }`}
                 >
                   {level}
                 </button>
               ))}
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {currentScreen === 'DASHBOARD' && (
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            
            {/* Level Selection Section */}
            <div className="text-center mb-10">
               <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">
                  Kies een niveau
               </h2>

               <div className="flex justify-center items-center gap-4 md:gap-6">
                  <button
                    onClick={() => handleLevelChange('A1')}
                    className={`px-8 py-3 rounded-full font-bold transition-all shadow-md transform hover:scale-105 ${
                        currentLevel === 'A1' 
                        ? 'bg-dutch-orange text-white ring-2 ring-orange-200' 
                        : 'bg-white text-gray-500 hover:text-dutch-orange'
                    }`}
                  >
                    A1
                  </button>

                  <button
                    onClick={() => handleLevelChange('A2')}
                    className={`px-8 py-3 rounded-full font-bold transition-all shadow-md transform hover:scale-105 ${
                        currentLevel === 'A2' 
                        ? 'bg-dutch-orange text-white ring-2 ring-orange-200' 
                        : 'bg-white text-gray-500 hover:text-dutch-orange'
                    }`}
                  >
                    A2
                  </button>

                  <button
                    onClick={() => handleLevelChange('B1')}
                    className={`px-8 py-3 rounded-full font-bold transition-all shadow-md transform hover:scale-105 ${
                        currentLevel === 'B1' 
                        ? 'bg-dutch-orange text-white ring-2 ring-orange-200' 
                        : 'bg-white text-gray-500 hover:text-dutch-orange'
                    }`}
                  >
                    B1
                  </button>
               </div>
            </div>

            <div className="mb-8 text-center">
              <p className="text-gray-600 max-w-2xl mx-auto">
                {currentLevel === 'A1' && 'Oefen met eenvoudige teksten en basisgrammatica. Voltooi alle lessen om de finale te openen.'}
                {currentLevel === 'A2' && 'Oefen met langere teksten en verleden tijd. Beantwoord ook de inzichtsvragen.'}
                {currentLevel === 'B1' && 'Gevorderde teksten over werk, maatschappij en actuele zaken. Focus op argumentatie en mening.'}
              </p>
            </div>

            {renderDifficultySection(1)}
            {renderDifficultySection(2)}
            {renderDifficultySection(3)}
            
          </div>
        )}

        {currentScreen === 'LESSON' && selectedLesson && (
          <LessonView
            lesson={selectedLesson}
            onBack={handleBackToDashboard}
            onComplete={handleLessonComplete}
          />
        )}
      </main>
    </div>
  );
}

export default App;