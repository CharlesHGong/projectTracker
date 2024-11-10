import React, { useEffect } from "react";
import { usePageStore } from "../store";
import { Header } from "../components/HomeHeader";
import { formatTime } from "../utils/dateUtils";
import { ProjectList } from "../components/ProjectList";
import { rangeLabelMap } from "../types";

export const HomePage = () => {
  const minimize = usePageStore((state) => state.minimize);
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
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      {!minimize && (
        <>
          <div style={{ flex: "1 1 auto", overflowY: "auto" }}>
            <ProjectList projectNames={projects.map((p) => p.name)} />
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
        </>
      )}
    </div>
  );
};
