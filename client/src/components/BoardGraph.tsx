import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import R3fForceGraph from "r3f-forcegraph";
import SpriteText from "three-spritetext";

export default function BoardGraph({ board }: { board: any }) {
  const fgRef = useRef<any>(null);
  useFrame(() => {
    fgRef.current.tickFrame();
  });

  // Convert the board data to the format required by R3F-ForceGraph
  const boardData = useMemo(() => {
    const nodes = [] as any[];
    const links = [] as any[];

    // Add components as nodes
    board.components.forEach((component: any) => {
      nodes.push({
        id: "Comp-" + component.name,
        name: component.name,
        group: "component",
      });
      // Add pins as nodes
      component.pins.forEach((pin: string) => {
        nodes.push({
          id: "Pin-" + component.name + "-" + pin,
          name: component.name + "." + pin,
          group: "pin",
        });
        // Add links between component and pins
        links.push({
          source: "Comp-" + component.name,
          target: "Pin-" + component.name + "-" + pin,
          group: "cmp-pin",
        });
      });
    });

    // Add nets as links
    board.nets.forEach((net: any) => {
      // Work out component and pin names
      const pinNames = net.pins.map((pin: string) => {
        const [compName, pinName] = pin.split(".");
        return {
          compName,
          pinName,
        };
      });
      // Add links between pins
      for (let i = 0; i < pinNames.length; i++) {
        for (let j = i + 1; j < pinNames.length; j++) {
          links.push({
            source: "Pin-" + pinNames[i].compName + "-" + pinNames[i].pinName,
            target: "Pin-" + pinNames[j].compName + "-" + pinNames[j].pinName,
            group: "net",
          });
        }
      }
    });

    return {
      nodes,
      links,
    };
  }, [board]);

  return (
    <>
      <R3fForceGraph
        ref={fgRef}
        graphData={boardData}
        nodeAutoColorBy={"group"}
        nodeThreeObject={(node) => {
          const sprite = new SpriteText(node.name);
          sprite.color = node.group === "component" ? "cyan" : "orange";
          sprite.textHeight = 8;
          return sprite;
        }}
        linkAutoColorBy={"group"}
        linkDirectionalParticles={(link) => {
          return link.group === "net" ? 4 : 0;
        }}
        linkDirectionalParticleWidth={2}
        linkWidth={(link) => {
          return link.group === "net" ? 4 : 2;
        }}
        linkDirectionalArrowLength={(link) => {
          return link.group === "net" ? 0 : 15;
        }}
        linkColor={(link) => {
          return link.group === "net" ? "green" : "white";
        }}
      />
    </>
  );
}
