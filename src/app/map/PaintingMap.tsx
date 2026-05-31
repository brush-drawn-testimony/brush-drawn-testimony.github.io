"use client";

import Map, { Layer, Source, type LayerProps, type MapRef } from "@vis.gl/react-maplibre";
import type { Feature, LineString, Point } from "geojson";
import type { StyleSpecification } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";

type LngLatPosition = [number, number];
type TravelBounds = [LngLatPosition, LngLatPosition];
type TravelBoundsFitter = Pick<MapRef, "fitBounds">;

interface PaintingMapProps {
    className?: string;
    start: { lat: number, lon: number }
    end?: { lat: number, lon: number }
}

const travelAnimationDurationMs = 4500;
const travelReplayPauseMs = 1300;
const singlePointBoundsPaddingDegrees = 2;

const transparentMapStyle: StyleSpecification = {
    version: 8,
    name: "Transparent historical borders",
    sources: {},
    layers: [
        {
            id: "map-background",
            type: "background",
            paint: {
                "background-color": "#f2f2f2",
                "background-opacity": 1.0
            },
        },
    ],
};

const world1938BorderLayer: LayerProps = {
    id: "world-1938-borders",
    type: "line",
    paint: {
        "line-color": "#000000",
        "line-width": 1,
    },
};

const world1938FillLayer: LayerProps = {
    id: "world-1938-fill",
    type: "fill",
    paint: {
        "fill-color": "#ffffff",
        "fill-opacity": 1.0
    },
};

const fullTravelRouteLayer: LayerProps = {
    id: "full-travel-route",
    type: "line",
    paint: {
        "line-color": "#000000",
        "line-opacity": 0.18,
        "line-width": 2,
        "line-dasharray": [2, 2],
    },
};

const animatedTravelRouteLayer: LayerProps = {
    id: "animated-travel-route",
    type: "line",
    paint: {
        "line-color": "#000000",
        "line-width": 3,
        "line-opacity": 0.9,
    },
};

const travelPointLayer: LayerProps = {
    id: "travel-point",
    type: "circle",
    paint: {
        "circle-color": "#000000",
        "circle-radius": 5,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 1.5,
    },
};

function toPosition(coordinate: { lat: number, lon: number }): LngLatPosition {
    return [coordinate.lon, coordinate.lat];
}

function interpolatePosition(start: LngLatPosition, end: LngLatPosition, progress: number): LngLatPosition {
    return [
        start[0] + (end[0] - start[0]) * progress,
        start[1] + (end[1] - start[1]) * progress,
    ];
}

function easeInOut(progress: number) {
    return progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
}

function createLineFeature(coordinates: LngLatPosition[]): Feature<LineString> {
    return {
        type: "Feature",
        properties: {},
        geometry: {
            type: "LineString",
            coordinates,
        },
    };
}

function createPointFeature(coordinate: LngLatPosition): Feature<Point> {
    return {
        type: "Feature",
        properties: {},
        geometry: {
            type: "Point",
            coordinates: coordinate,
        },
    };
}

function createTravelBounds(start: LngLatPosition, end?: LngLatPosition): TravelBounds {
    if (end == null || (start[0] === end[0] && start[1] === end[1])) {
        return [
            [
                start[0] - singlePointBoundsPaddingDegrees,
                start[1] - singlePointBoundsPaddingDegrees,
            ],
            [
                start[0] + singlePointBoundsPaddingDegrees,
                start[1] + singlePointBoundsPaddingDegrees,
            ],
        ];
    }

    return [
        [Math.min(start[0], end[0]), Math.min(start[1], end[1])],
        [Math.max(start[0], end[0]), Math.max(start[1], end[1])],
    ];
}

function fitMapToTravelBounds(map: TravelBoundsFitter, bounds: TravelBounds) {
    map.fitBounds(bounds, {
        padding: 48,
        duration: 900,
        maxZoom: 5,
    });
}

export function PaintingMap(props: PaintingMapProps) {
    const mapRef = useRef<MapRef | null>(null);
    const [animationProgress, setAnimationProgress] = useState(props.end ? 0 : 1);

    const startPosition = useMemo(() => toPosition(props.start), [props.start.lat, props.start.lon]);
    const endPosition = useMemo(() => props.end ? toPosition(props.end) : undefined, [props.end?.lat, props.end?.lon]);
    const travelBounds = useMemo(() => createTravelBounds(startPosition, endPosition), [startPosition, endPosition]);

    const routeFeature = useMemo(() => {
        if (endPosition == null) {
            return createLineFeature([startPosition, startPosition]);
        }

        return createLineFeature([startPosition, endPosition]);
    }, [startPosition, endPosition]);

    const currentPosition = useMemo(() => {
        if (endPosition == null) {
            return startPosition;
        }

        return interpolatePosition(startPosition, endPosition, animationProgress);
    }, [animationProgress, endPosition, startPosition]);

    const animatedRouteFeature = useMemo(() => {
        return createLineFeature([startPosition, currentPosition]);
    }, [currentPosition, startPosition]);

    const travelPointFeature = useMemo(() => {
        return createPointFeature(currentPosition);
    }, [currentPosition]);

    useEffect(() => {
        if (endPosition == null) {
            setAnimationProgress(1);
            return;
        }

        setAnimationProgress(0);

        let animationFrame = 0;
        let startedAt: number | undefined;

        function animate(timestamp: number) {
            startedAt ??= timestamp;

            const elapsed = timestamp - startedAt;
            const replayDuration = travelAnimationDurationMs + travelReplayPauseMs;
            const replayElapsed = elapsed % replayDuration;
            const linearProgress = Math.min(replayElapsed / travelAnimationDurationMs, 1);
            setAnimationProgress(easeInOut(linearProgress));

            animationFrame = window.requestAnimationFrame(animate);
        }

        animationFrame = window.requestAnimationFrame(animate);

        return () => {
            window.cancelAnimationFrame(animationFrame);
        };
    }, [endPosition]);

    useEffect(() => {
        const map = mapRef.current;

        if (map == null) {
            return;
        }

        fitMapToTravelBounds(map, travelBounds);
    }, [travelBounds]);

    return (
        <div className={`painting-map size-full bg-transparent z-1 ${props.className ?? ""}`}>
            <Map
                ref={mapRef}
                style={{ width: "100%", height: "100%" }}
                initialViewState={{
                    longitude: 10,
                    latitude: 30,
                    zoom: 1.15,
                }}
                mapStyle={transparentMapStyle}
                minZoom={0.75}
                maxZoom={8}
                projection="mercator"
                attributionControl={false}
                dragPan={false}
                scrollZoom={false}
                boxZoom={false}
                doubleClickZoom={false}
                touchZoomRotate={false}
                dragRotate={false}
                keyboard={false}
                onLoad={(event) => {
                    fitMapToTravelBounds(event.target, travelBounds);
                }}
            >
                <Source id="world1938" type="geojson" data="/maps/world_1938.geojson">
                    <Layer {...world1938FillLayer} />
                    <Layer {...world1938BorderLayer} />
                </Source>
                <Source id="fullTravelRoute" type="geojson" data={routeFeature}>
                    <Layer {...fullTravelRouteLayer} />
                </Source>
                <Source id="animatedTravelRoute" type="geojson" data={animatedRouteFeature}>
                    <Layer {...animatedTravelRouteLayer} />
                </Source>
                <Source id="travelPoint" type="geojson" data={travelPointFeature}>
                    <Layer {...travelPointLayer} />
                </Source>
            </Map>
        </div>
    );
}
