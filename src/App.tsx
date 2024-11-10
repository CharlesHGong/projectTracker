import React from 'react';
import './App.css';
import { usePageStore } from './store';
import { HomePage } from './pages/Home';
import { ProjectPage } from './pages/Project';


function App() {
  const page = usePageStore((state) => state.page);
  const bgAlpha = usePageStore((state) => state.bgAlpha);

  return (
    <div style={{ backgroundColor: `rgba(50, 50, 50, ${bgAlpha})` }} className='widget'>
      {page === 'home' ? <HomePage /> : <ProjectPage name={page.slice('project/'.length)} />}
    </div>
  );
}

export default App;
