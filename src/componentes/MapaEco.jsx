


import React from 'react';
import {useState, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';

import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from '@deck.gl/layers';
import {MaskExtension} from '@deck.gl/extensions';

import {load} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';

import AnimatedArcLayer from '../utils/animated-arc-group-layer';
import RangeInput from '../utils/range-input';
// Data source

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const INITIAL_VIEW_STATE = {
  longitude: -99.2,
  latitude:19.4,
  zoom: 12,
  maxZoom: 20
};

/* eslint-disable react/no-deprecated */
export default function MapaEco({
  data,
  mapStyle = MAP_STYLE,
  showFlights = true,
  timeWindow = 300,
  animationSpeed = 5
}) {
  const [currentTime, setCurrentTime] = useState(0);

  const citiesLayers = useMemo(
    () => [


      new GeoJsonLayer({
        id: 'cities-highlight',
        data: 'https://raw.githubusercontent.com/jdanielgoh/ecobaby/main/data/cicloestaciones.geojson',

        pointType: 'circle',
        pointRadiusUnits: 'common',
        pointRadiusScale: 0.2,
        pointRadiusMinPixels: 1,
        pointRadiusMaxPixels: 2,
        getFillColor: [20, 20, 20, 90],

        getLineWidth: 1,
        lineWidthUnits: 'pixels',
        filled: true,
        stroked: false,

        //extensions: [new MaskExtension()],
        //maskId: 'flight-mask'
      })
    ],
    []
  );
  const flightLayerProps = {
    data,
    greatCircle: true,
    getSourcePosition: d => [d.r_lon, d.r_lat],
    getTargetPosition: d => [d.a_lon, d.a_lat],
    getSourceTimestamp: d => d.r_f,
    getTargetTimestamp: d => d.a_f,
    getHeight: 0
  };

  const flightPathsLayer =
    showFlights &&
    new AnimatedArcLayer({
      ...flightLayerProps,
      id: 'flight-paths',
      timeRange: [currentTime - 240, currentTime], // 10 minutes
      getWidth: 0.2,
      widthMinPixels: 1,
      widthMaxPixels: 4,
      widthUnits: 'common',
      getSourceColor: [200, 10, 10],
      getTargetColor: [0, 154, 68],
      parameters: {depthTcitiesest: false}
    });

  const flightMaskLayer = new AnimatedArcLayer({
    ...flightLayerProps,
    id: 'flight-mask',
    timeRange: [currentTime - timeWindow * 4, currentTime],
    operation: 'mask',
    getWidth: 10,
    widthUnits: 'meters'
  });

  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[flightPathsLayer,flightMaskLayer, citiesLayers]}
      >
        <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
      </DeckGL>
      {data && (
        <RangeInput
          min={0}
          max={2678399}
          value={currentTime}
          animationSpeed={animationSpeed}
          formatLabel={formatTimeLabel}
          onChange={setCurrentTime}
        />
      )}
    </>
  );
}

function formatTimeLabel(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds / 60) % 60;
  const s = seconds % 60;
  return [h, m, s].map(x => x.toString().padStart(2, '0')).join(':');
}
