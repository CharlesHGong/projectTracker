import React, { useEffect } from 'react';
import './App.css';
import { usePageStore } from './store';
import { PopoverInput } from './components/PopoverInput';
import { Button } from 'antd';
import { PlusOutlined, CaretDownOutlined } from "@ant-design/icons";
import { ProjectSelect } from './components/ProjectSelect';
import { request } from './api';
import { ProjectTracker } from './components/ProjectTracker';


function App() {
  const projects = usePageStore((state) => state.projects);
  return (
    <div className="widget">
      <div className="no-drag">
        <PopoverInput onConfirm={(inputValue) => { request({ method: 'createProject', payload: inputValue }) }}>
          <Button icon={<PlusOutlined />} size="small" />
        </PopoverInput>
        <ProjectSelect onConfirm={(inputValue) => { console.log(inputValue); }}>
          <Button icon={<CaretDownOutlined />} size="small" />
        </ProjectSelect>
      </div>


      <div className="no-drag">
        {projects.map(({ name }) => <ProjectTracker name={name} key={name} />)}
      </div>
    </div>
  );
}

export default App;
