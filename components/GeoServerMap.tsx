"use client";

import { useEffect, useRef } from "react";
import "ol/ol.css";

import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import TileWMS from "ol/source/TileWMS.js";
import { fromLonLat } from "ol/proj.js";

export default function GeoServerMap() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const wmsUrl = process.env.NEXT_PUBLIC_GEOSERVER_WMS_URL;
    const layerName = process.env.NEXT_PUBLIC_GEOSERVER_LAYER;

    if (!wmsUrl || !layerName) {
      return;
    }

    const lon = Number(
      process.env.NEXT_PUBLIC_GEOSERVER_CENTER_LON ?? "151.2093"
    );
    const lat = Number(
      process.env.NEXT_PUBLIC_GEOSERVER_CENTER_LAT ?? "-33.8688"
    );
    const zoom = Number(process.env.NEXT_PUBLIC_GEOSERVER_ZOOM ?? "12");

    const baseLayer = new TileLayer({
      source: new OSM(),
    });

    const geoServerLayer = new TileLayer({
      source: new TileWMS({
        url: wmsUrl,
        params: {
          LAYERS: layerName,
          TILED: true,
          TRANSPARENT: true,
          FORMAT: "image/png",
        },
        serverType: "geoserver",
        crossOrigin: "anonymous",
      }),
      opacity: 0.85,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, geoServerLayer],
      view: new View({
        center: fromLonLat([lon, lat]),
        zoom,
      }),
    });

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  const hasConfig =
    process.env.NEXT_PUBLIC_GEOSERVER_WMS_URL &&
    process.env.NEXT_PUBLIC_GEOSERVER_LAYER;

  if (!hasConfig) {
    return (
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        GeoServer WMS config is missing. Please set
        <code className="mx-1">NEXT_PUBLIC_GEOSERVER_WMS_URL</code>
        and
        <code className="mx-1">NEXT_PUBLIC_GEOSERVER_LAYER</code>
        in <code className="mx-1">.env.local</code>.
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900">
          GeoServer Read-Only Layer
        </h3>
        <p className="text-sm text-gray-500">
          WMS overlay from your local GeoServer
        </p>
      </div>

      <div
        ref={mapRef}
        className="h-[640px] w-full overflow-hidden rounded-2xl border border-gray-200"
      />
    </div>
  );
}