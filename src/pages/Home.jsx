import React, { useEffect } from "react";
import { usePageStore } from "../store";
import { Header } from "../components/Header";
import { formatTime } from "../utils/dateUtils";
import { rangeLabelMap } from "../components/HomeMenuDropdown";
import { ProjectList } from "../components/ProjectList";

export const HomePage = () => {
  const projects = usePageStore((state) => state.projects);
  const previousTime = usePageStore((state) =>
    state.projects
      .flatMap((p) => p.logs)
      .reduce((acc, log) => log.endTime - log.startTime + acc, 0)
  );
  const currentTime = usePageStore((state) =>
    state.now && state.startTime ? state.now - state.startTime : 0
  );
  const totalTime = formatTime(previousTime + currentTime);
  const range = usePageStore((state) => state.range);

  useEffect(() => {
    usePageStore.getState().getProjectNames();
  }, []);

  return (
    <>
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
          <div className="no-drag">
            <ProjectList projectNames={projects.map((p) => p.name)} />
          </div>
        </div>
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            alignItems: "baseline",
            paddingLeft: "8px",
          }}
        >
          <div style={{ marginLeft: 16 }}>{rangeLabelMap[range]}</div>
          <div style={{ textAlign: "center" }}>{totalTime}</div>
          <div />
        </div>
      </div>
    </>
  );
};
