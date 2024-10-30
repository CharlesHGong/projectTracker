import React from 'react';
import './App.css';
import { usePageStore } from './store';
import { HomePage } from './pages/Home';
import { ProjectPage } from './pages/Project';


function App() {
  const page = usePageStore((state) => state.page);

  return (
    page === 'home' ? <HomePage /> : <ProjectPage name={page.slice('project/'.length)} />
  );
}

export default App;
