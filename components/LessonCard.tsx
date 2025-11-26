import React from 'react';
import { LessonData } from '../types';
import { BookOpen, Flame, BarChart, CheckCircle2, Smile } from 'lucide-react';

interface LessonCardProps {
  lesson: LessonData;
  onClick: (lesson: LessonData) => void;
  isCompleted?: boolean;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onClick, isCompleted }) => {
  const isGenerated = lesson.isGenerated;
  const isFinalTest = lesson.meta.theme.toLowerCase().includes('eindtest');

  return (
    <div
      onClick={() => onClick(lesson)}
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border overflow-hidden group transform hover:-translate-y-1 flex flex-col h-full relative ${isGenerated ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-100'}`}
    >
      {/* Completed Badge */}
      {isCompleted && (
        <div className="absolute top-3 right-3 z-10 bg-green-500 text-white rounded-full p-1 shadow-sm">
          <CheckCircle2 size={16} />
        </div>
      )}

      <div className={`h-2 w-full ${isGenerated ? 'bg-amber-500' : 'bg-dutch-orange'}`} />
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4 pr-6">
          <span className="bg-blue-100 text-dutch-blue text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide truncate max-w-[70%]">
            {lesson.meta.theme}
          </span>
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide flex items-center">
            <BarChart size={12} className="mr-1" />
            {lesson.meta.level_erk}
          </span>
        </div>
        <h3 className={`text-xl font-bold mb-2 transition-colors ${isGenerated ? 'text-amber-600' : 'text-gray-800 group-hover:text-dutch-orange'}`}>
          {lesson.text_content.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-grow">
          {lesson.text_content.body}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
           <div className={`flex items-center text-sm font-semibold ${isGenerated ? 'text-amber-600' : 'text-dutch-blue'}`}>
            <BookOpen size={16} className="mr-2" />
            Start Les
          </div>
          <div className="flex items-center text-orange-500" title={`Moeilijkheid: ${lesson.meta.difficulty}/3`}>
            {[...Array(3)].map((_, i) => (
              isFinalTest ? (
                 <Smile 
                    key={i} 
                    size={18} 
                    fill={i < lesson.meta.difficulty ? "currentColor" : "none"} 
                    className={i < lesson.meta.difficulty ? "text-orange-500" : "text-gray-300"}
                  />
              ) : (
                  <Flame 
                    key={i} 
                    size={18} 
                    fill={i < lesson.meta.difficulty ? "currentColor" : "none"} 
                    className={i < lesson.meta.difficulty ? "text-orange-500" : "text-gray-300"}
                  />
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonCard;