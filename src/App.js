"use client";

import "./App.css";

import { useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

function App() {
  const position = { lat: 14.61, lng: 120.9893 };
  const [open, setOpen] = useState(false);
  return (
    <APIProvider apiKey="AIzaSyDzldCRAiwwd05H9U-_wm9jUzUjbKZRd3A">
      <div style={{ height: "100vh", width: "100%" }}>
        <Map
          defaultZoom={9}
          defaultCenter={position}
          mapId={"7e2addf355611718"}
        >
          <AdvancedMarker position={position} onClick={() => setOpen(true)}>
            <Pin
              background={"orange"}
              borderColor={"blue"}
              glyphColor={"yellow"}
            ></Pin>
          </AdvancedMarker>
          {open && (
            <InfoWindow position={position} onCloseClick={() => setOpen(false)}>
              <p>I'm in UST WOW I'm a tiger</p>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}

export default App;
