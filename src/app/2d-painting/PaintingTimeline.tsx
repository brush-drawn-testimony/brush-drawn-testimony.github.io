"use client";
import { useMemo } from "react";
import SVG from "react-inlinesvg";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../../store/store";
import { setSelectedPainting } from "../../../store/appSlice";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

export interface PaintingTimelineProps {
  paintings: Array<any>;
}

export function PaintingTimeline(props: PaintingTimelineProps) {
  const { paintings } = props;
  const dispatch = useDispatch();
  const selectedPainting = useSelector(
    (state: State) => state.app.selectedPainting
  );

  const svgs = useMemo(() => {
    return paintings.map((e) => {
      return e.svgFile;
    });
  }, [paintings]);

  return (
    <div className="size-full items-center grid grid-cols-[64px_auto_64px] gap-2 border-t border-gray-300 relative">
      {selectedPainting > 0 && (
        <div
          className="rounded-full px-2 size-16 shadow hover:shadow-lg hover:bg-gray-400 hover:text-white cursor-pointer items-center justify-center flex"
          onClick={() => {
            dispatch(
              setSelectedPainting((selectedPainting - 1) % paintings.length)
            );
          }}
        >
          <ChevronLeftIcon className="size-7" />
        </div>
      )}
      <div
        className="w-full h-22 grid items-center painting-timeline relative col-start-2"
        style={{
          gridTemplateColumns: `repeat(${Math.max(
            1,
            svgs.length
          )}, minmax(0, 1fr))`,
        }}
      >
        {svgs.map((e, i) => {
          return (
            <div className="relative items-center justify-between flex pr-5">
              <div className="absolute top-0 left-0 w-full h-full flex items-center">
                <div
                  className={`h-1 mt-[4px] w-full ${
                    i < selectedPainting ? "bg-gray-400" : "bg-gray-200"
                  }`}
                ></div>
              </div>
              <div
                className={`size-18 rounded-full overflow-hidden bg-slate-50 relative cursor-pointer shadow-md items-center ${
                  selectedPainting === i ? "border-2 border-gray-400" : ""
                }`}
                key={`timeline-entry-${i}`}
                onClick={() => {
                  dispatch(setSelectedPainting(i));
                }}
              >
                <SVG
                  src={e}
                  className="size-full object-contain absolute"
                  // style={{
                  //   backgroundImage: "url('/assets/paper-texture.jpg')",
                  // }}
                  preProcessor={(code) => {
                    return code.replaceAll('id="', 'id="timeline-');
                  }}
                />
              </div>
              {selectedPainting === i && (
                <>
                  <div
                    className={`size-12 rounded-full overflow-hidden bg-slate-50 relative cursor-pointer shadow-md items-center`}
                    key={`timeline-sub-entry-${i}`}
                    onClick={() => {
                      dispatch(setSelectedPainting(i));
                    }}
                  ></div>
                  <div
                    className={`size-12 rounded-full overflow-hidden bg-slate-50 relative cursor-pointer shadow-md items-center`}
                    key={`timeline-sub-entry-${i}-2`}
                    onClick={() => {
                      dispatch(setSelectedPainting(i));
                    }}
                  ></div>
                </>
              )}
            </div>
          );
        })}
      </div>
      {selectedPainting + 1 < paintings.length && (
        <div
          className="px-2 shadow hover:shadow-lg hover:bg-gray-400 hover:text-white cursor-pointer size-16 rounded-full justify-center items-center flex"
          onClick={() => {
            dispatch(
              setSelectedPainting((selectedPainting + 1) % paintings.length)
            );
          }}
        >
          <ChevronRightIcon className="size-7" />
        </div>
      )}
      <svg className="size-full absolute top-0 left-0 pointer-events-none">
        <filter id="roughpaper-timeline">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            result="noise"
            numOctaves="5"
          />

          <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="2">
            <feDistantLight azimuth="45" elevation="60" />
          </feDiffuseLighting>
        </filter>
        <rect
          width={"100%"}
          height={"100%"}
          filter="url(#roughpaper-timeline)"
          opacity={0.3}
          fill="white"
        />
      </svg>
    </div>
  );
}
