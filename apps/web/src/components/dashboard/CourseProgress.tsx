import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { ProgressBar, CourseIcon } from '@ingresa-pe/ui';
import { mockCourses, Course } from '../../data/dashboard-mock';

export function CourseProgress() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course>(mockCourses[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 flex items-center justify-between bg-white transition-all w-full text-left rounded-2xl shadow-lg active:translate-y-[2px] active:shadow-sm ring-1 ring-black/5"
      >
        <div className="flex items-center gap-3 w-full">
          {/* Aquí va el nuevo SVG original del libro 3D exportado */}
          <CourseIcon className="w-[36px] h-[36px] shrink-0" />
          <div className="flex flex-col items-start flex-1 pr-2 w-full">
            <span className="text-[10px] font-extrabold text-surface-400 uppercase tracking-widest leading-none mb-1">
              Curso Actual
            </span>
            <span className="text-lg font-black text-primary-950 leading-none mb-2">
              {selectedCourse.title}
            </span>
            <ProgressBar
              progress={selectedCourse.progress}
              variant="success"
              size="sm"
            />
          </div>
        </div>
        <div className="w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center border-2 border-surface-200 shrink-0 ml-2">
          <ChevronDown
            size={20}
            className={`text-surface-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            strokeWidth={3}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl p-2 shadow-xl ring-1 ring-black/5 z-50">
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {mockCourses.map((course) => (
              <button
                key={course.id}
                onClick={() => {
                  setSelectedCourse(course);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                  selectedCourse.id === course.id
                    ? 'bg-primary-50 text-primary-900 border-2 border-primary-200'
                    : 'hover:bg-surface-50 text-surface-700 border-2 border-transparent border-b-surface-100'
                }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center">
                    <CourseIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{course.title}</h3>
                    <p className="text-xs text-surface-400 font-medium">
                      Progreso: {course.progress}%
                    </p>
                  </div>
                </div>
                {selectedCourse.id === course.id && (
                  <Check
                    size={20}
                    className="text-primary-600"
                    strokeWidth={3}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
