import React, { useEffect } from "react";
import { usePageStore } from "../store";
import { ProjectTracker } from "../components/ProjectTracker";
import { Header } from "../components/Header";

export const HomePage = () => {
  const projects = usePageStore((state) => state.projects);

  useEffect(() => {
    usePageStore.getState().getProjectNames();
  }, []);

  return (
    <div className="widget">
      <Header />
      <div className="no-drag">
        {projects.map(({ name }) => (
          <ProjectTracker name={name} key={name} />
        ))}
      </div>
    </div>
  );
};
