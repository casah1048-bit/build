
import React, { useState, useEffect } from 'react';
import { View, UserProject, CrochetPattern } from './types';
import { STITCH_GLOSSARY } from './constants';
import StitchCounter from './components/StitchCounter';
import PatternGenerator from './components/PatternGenerator';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Load projects from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('crochet_projects');
    if (saved) setProjects(JSON.parse(saved));
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    localStorage.setItem('crochet_projects', JSON.stringify(projects));
  }, [projects]);

  const activeProject = projects.find(p => p.id === selectedProjectId);

  const startProject = (pattern: CrochetPattern) => {
    const newProject: UserProject = {
      id: Math.random().toString(36).substr(2, 9),
      pattern,
      currentStepIndex: 0,
      notes: '',
      startDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      counter: 0,
    };
    setProjects([newProject, ...projects]);
    setSelectedProjectId(newProject.id);
    setCurrentView('project');
  };

  const updateProjectCounter = (projectId: string, val: number) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, counter: val, lastModified: new Date().toISOString() } : p
    ));
  };

  const deleteProject = (id: string) => {
    if (confirm('Delete this project?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
        setCurrentView('home');
      }
    }
  };

  const renderHome = () => (
    <div className="flex flex-col h-full">
      <header className="px-6 py-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Your Projects</h1>
        <p className="text-slate-500">Pick up where you left off</p>
      </header>
      
      <div className="flex-1 overflow-y-auto px-6 pb-24 custom-scrollbar">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-scroll text-rose-300 text-3xl"></i>
            </div>
            <p className="text-slate-400 font-medium">No projects yet.<br/>Start by generating a pattern!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {projects.map(project => (
              <div 
                key={project.id}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setCurrentView('project');
                }}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3 active:scale-[0.98] transition-transform"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-full">
                      {project.pattern.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 mt-1">{project.pattern.title}</h3>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                    className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500"
                  >
                    <i className="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-slate-500 text-xs font-medium">
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-layer-group text-rose-300"></i>
                    Row {project.counter}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-clock text-rose-300"></i>
                    {new Date(project.lastModified).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setCurrentView('generate')}
        className="fixed bottom-24 right-6 w-16 h-16 bg-rose-500 text-white rounded-2xl shadow-xl shadow-rose-200 flex items-center justify-center text-2xl active:scale-90 transition-transform z-10"
      >
        <i className="fa-solid fa-plus"></i>
      </button>
    </div>
  );

  const renderProjectDetail = () => {
    if (!activeProject) return null;
    return (
      <div className="flex flex-col h-full bg-white">
        <header className="px-6 py-6 border-b border-slate-50 flex items-center gap-4 sticky top-0 bg-white z-10">
          <button 
            onClick={() => setCurrentView('home')}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <div className="flex-1 overflow-hidden">
            <h2 className="text-lg font-bold text-slate-800 truncate">{activeProject.pattern.title}</h2>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{activeProject.pattern.difficulty}</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8 pb-32">
          <div className="mb-8">
            <StitchCounter 
              initialValue={activeProject.counter} 
              onUpdate={(v) => updateProjectCounter(activeProject.id, v)} 
            />
          </div>

          <section className="mb-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Materials Needed</h3>
            <ul className="space-y-2">
              {activeProject.pattern.materials.map((m, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                  {m}
                </li>
              ))}
              <li className="flex items-center gap-3 text-slate-700 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                Hook Size: {activeProject.pattern.hookSize}
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Pattern Instructions</h3>
            <div className="space-y-4">
              {activeProject.pattern.instructions.map((step, i) => (
                <div 
                  key={i} 
                  className={`p-4 rounded-2xl border transition-colors ${activeProject.counter === i ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-transparent'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter">
                      {step.roundOrRow}
                    </span>
                    {activeProject.counter > i && (
                      <i className="fa-solid fa-circle-check text-green-500 text-xs"></i>
                    )}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">{step.step}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Stitch Glossary</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(activeProject.pattern.abbreviations).map(([key, val]) => (
                <div key={key} className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-xs font-bold text-slate-800 uppercase">{key}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">{val as string}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderGlossary = () => (
    <div className="flex flex-col h-full p-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Learning Center</h2>
        <p className="text-slate-500">Master new stitches & techniques</p>
      </header>
      
      <div className="space-y-4 overflow-y-auto pb-24 custom-scrollbar">
        {STITCH_GLOSSARY.map((stitch, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shrink-0">
              <i className="fa-solid fa-hand-dots text-xl"></i>
            </div>
            <div>
              <h4 className="font-bold text-slate-800">{stitch.name}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{stitch.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full max-w-md mx-auto relative overflow-hidden bg-slate-50 border-x border-slate-100 shadow-2xl">
      {/* Viewport Content */}
      <main className="flex-1 overflow-hidden">
        {currentView === 'home' && renderHome()}
        {currentView === 'generate' && (
          <PatternGenerator onPatternCreated={startProject} />
        )}
        {currentView === 'project' && renderProjectDetail()}
        {currentView === 'glossary' && renderGlossary()}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-20 bg-white/80 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-4 safe-area-bottom z-20">
        <button 
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'home' ? 'text-rose-500' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-house-chimney text-lg"></i>
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button 
          onClick={() => setCurrentView('generate')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'generate' ? 'text-rose-500' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-wand-magic-sparkles text-lg"></i>
          <span className="text-[10px] font-bold uppercase tracking-widest">AI Lab</span>
        </button>
        <button 
          onClick={() => setCurrentView('glossary')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'glossary' ? 'text-rose-500' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-book-open text-lg"></i>
          <span className="text-[10px] font-bold uppercase tracking-widest">Learn</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
