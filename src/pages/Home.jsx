import React, { useEffect } from "react";
import { usePageStore } from "../store";
import { ProjectTracker } from "../components/ProjectTracker";
import { Header } from "../components/Header";
import { formatTime } from "../utils/dateUtils";
import { rangeLabelMap } from "../components/HomeMenuDropdown";

export const HomePage = () => {
  const projects = usePageStore((state) => state.projects);
  const totalTime = usePageStore((state) =>
    formatTime(
      state.projects
        .flatMap((p) => p.logs)
        .reduce((acc, log) => log.endTime - log.startTime + acc, 0)
    )
  );
  const range = usePageStore((state) => state.range);

  useEffect(() => {
    usePageStore.getState().getProjectNames();
  }, []);

  return (
    <div className="widget">
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Header />
          <div>
            {projects.map(({ name }) => (
              <ProjectTracker name={name} key={name} />
            ))}
          </div>
        </div>
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            alignItems: "baseline",
          }}
        >
          <div style={{ marginLeft: 16 }}>{rangeLabelMap[range]}</div>
          <div style={{ textAlign: "center" }}>{totalTime}</div>
          <div />
        </div>
      </div>
    </div>
  );
};
