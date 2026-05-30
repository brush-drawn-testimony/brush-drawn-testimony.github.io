"use client";

import Map, { Layer, Source, type LayerProps } from "@vis.gl/react-maplibre";
import type { StyleSpecification } from "maplibre-gl";

interface PaintingMapProps {
    className?: string;
    start: { lat: number, lon: number }
    end?: { lat: number, lon: number }
}

const transparentMapStyle: StyleSpecification = {
    version: 8,
    name: "Transparent historical borders",
    sources: {},
    layers: [],
};

const world1938BorderLayer: LayerProps = {
    id: "world-1938-borders",
    type: "line",
    paint: {
        "line-color": "#000000",
        "line-width": 1,
    },
};

export function PaintingMap(props: PaintingMapProps) {
    return (
        <div className={`painting-map size-full bg-transparent ${props.className ?? ""}`}>
            <Map
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
            >
                <Source id="world1938" type="geojson" data="/maps/world_1938.geojson">
                    <Layer {...world1938BorderLayer} />
                </Source>
            </Map>
        </div>
    );
}
