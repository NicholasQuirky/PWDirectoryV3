import { Link, Head } from "@inertiajs/react";
import UserAuthenticatedLayout from "@/Layouts/UserAuthenticatedLayout";
import { useState, useEffect, useRef } from "react";
import {
    APIProvider,
    Map,
    AdvancedMarker,
    InfoWindow,
} from "@vis.gl/react-google-maps";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";
import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

export default function UserHome({ auth }) {
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [searchedPlaces, setSearchedPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [filterType, setFilterType] = useState("");
    const [availableTypes, setAvailableTypes] = useState([]);
    const [sortType, setSortType] = useState("");
    const [userLocation, setUserLocation] = useState(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
            initializeMap();
        }
    }, []);

    const initializeMap = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setUserLocation(location);
                    setSelectedLocation(location);
                    initializeGoogleMap(location);

                    // Only fetch places when userLocation is fully set
                    if (location.lat && location.lng) {
                        fetchPlaces(location);
                    }
                },
                () => {
                    console.error("Geolocation permission denied or failed.");
                    const defaultLocation = { lat: 14.5995, lng: 120.9842 }; // Manila's default coordinates
                    setUserLocation(defaultLocation);
                    setSelectedLocation(defaultLocation);
                    initializeGoogleMap(defaultLocation);

                    // Fetch places for the default location
                    if (defaultLocation.lat && defaultLocation.lng) {
                        fetchPlaces(defaultLocation);
                    }
                }
            );
        } else {
            console.error("Your browser doesn't support geolocation.");
            const defaultLocation = { lat: 14.5995, lng: 120.9842 }; // Manila's default coordinates
            setUserLocation(defaultLocation);
            setSelectedLocation(defaultLocation);
            initializeGoogleMap(defaultLocation);

            // Fetch places for the default location
            if (defaultLocation.lat && defaultLocation.lng) {
                fetchPlaces(defaultLocation);
            }
        }
    };

    const initializeGoogleMap = (location) => {
        const map = new window.google.maps.Map(document.createElement("div"), {
            center: location,
            zoom: 12,
        });
        mapRef.current = map;
        addMarker(location);
    };

    let markers = [];

    const clearMarkers = () => {
        if (markers.length > 0) {
            markers.forEach((marker) => marker.setMap(null));
            markers = [];
        }
    };

    const fetchPlaces = async (location) => {
        if (!mapRef.current) {
            console.error("Map is not initialized yet.");
            return;
        }

        // Ensure the map is fully loaded before clearing markers
        setTimeout(() => clearMarkers(), 1000);

        const { Place } = await google.maps.importLibrary("places");
        const service = new window.google.maps.places.PlacesService(
            mapRef.current
        );

        const request = {
            location,
            radius: 4000,
        };

        let allResults = [];
        let moreResults = true;

        while (moreResults) {
            try {
                const results = await new Promise((resolve, reject) => {
                    service.nearbySearch(request, (res, status) => {
                        if (
                            status ===
                            window.google.maps.places.PlacesServiceStatus.OK
                        ) {
                            resolve(res);
                        } else {
                            reject(status);
                        }
                    });
                });

                allResults = [...allResults, ...results];
                if (results.next_page_token) {
                    request.pageToken = results.next_page_token;
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                } else {
                    moreResults = false;
                }
            } catch (error) {
                console.error("PlacesService failed:", error);
                moreResults = false;
            }
        }

        try {
            const accessiblePlaces = await Promise.all(
                allResults.map(async (place) => {
                    const accessibilityOptions = await checkPlaceAccessibility(
                        place.place_id
                    );

                    if (
                        accessibilityOptions.accessibleEntrance ||
                        accessibilityOptions.accessibleParking ||
                        accessibilityOptions.accessibleRestroom ||
                        accessibilityOptions.accessibleSeating
                    ) {
                        const distance = calculateDistance(
                            userLocation,
                            place.geometry.location
                        );

                        const marker = new window.google.maps.Marker({
                            map: mapRef.current,
                            position: place.geometry.location,
                            title: place.name,
                        });

                        markers.push(marker);

                        return {
                            ...place,
                            accessible: true,
                            distance,
                            accessibilityOptions,
                        };
                    } else {
                        return null;
                    }
                })
            );

            const filteredPlaces = accessiblePlaces.filter(Boolean);
            setNearbyPlaces(filteredPlaces);
        } catch (error) {
            console.error("Error fetching places:", error);
        }
    };

    const checkPlaceAccessibility = async (placeId) => {
        try {
            const { Place } = await google.maps.importLibrary("places");

            const place = new Place({ id: placeId, requestedLanguage: "en" });

            await place.fetchFields({
                fields: [
                    "displayName",
                    "types",
                    "formattedAddress",
                    "location",
                    "accessibilityOptions",
                ],
            });

            const { accessibilityOptions } = place;

            const hasWheelchairAccessibleEntrance =
                accessibilityOptions?.hasWheelchairAccessibleEntrance || false;
            const hasWheelchairAccessibleParking =
                accessibilityOptions?.hasWheelchairAccessibleParking || false;
            const hasWheelchairAccessibleRestroom =
                accessibilityOptions?.hasWheelchairAccessibleRestroom || false;
            const hasWheelchairAccessibleSeating =
                accessibilityOptions?.hasWheelchairAccessibleSeating || false;

            return {
                accessibleParking: hasWheelchairAccessibleParking,
                accessibleEntrance: hasWheelchairAccessibleEntrance,
                accessibleRestroom: hasWheelchairAccessibleRestroom,
                accessibleSeating: hasWheelchairAccessibleSeating,
            };
        } catch (error) {
            console.error("Error fetching accessibility details:", error);
            return {
                accessibleParking: false,
                accessibleEntrance: false,
                accessibleRestroom: false,
                accessibleSeating: false,
            };
        }
    };

    const addMarker = (location) => {
        if (
            mapRef.current &&
            mapRef.current instanceof window.google.maps.Map
        ) {
            new window.google.maps.Marker({
                position: location,
                map: mapRef.current,
            });
        } else {
            console.error("Map instance is not loaded");
        }
    };

    const updateAvailableTypes = (places) => {
        const types = new Set();
        places.forEach((place) => {
            if (place.types) {
                place.types.forEach((type) => types.add(type));
            }
        });
        setAvailableTypes([...types]);
    };

    const calculateDistance = (userLocation, placeLocation) => {
        // Ensure Google Maps geometry library is available
        if (
            !window.google ||
            !window.google.maps ||
            !window.google.maps.geometry
        ) {
            console.error("Google Maps geometry library is not loaded.");
            return null;
        }

        // Ensure both userLocation and placeLocation are available
        if (!userLocation || !placeLocation) {
            console.error("Location data is missing");
            return null; // Early return if location data is incomplete
        }

        const userLatLng = new google.maps.LatLng(
            userLocation.lat,
            userLocation.lng
        );

        const placeLat =
            typeof placeLocation.lat === "function"
                ? placeLocation.lat()
                : placeLocation.lat;
        const placeLng =
            typeof placeLocation.lng === "function"
                ? placeLocation.lng()
                : placeLocation.lng;

        if (placeLat === undefined || placeLng === undefined) {
            console.error("Invalid placeLocation data", placeLocation);
            return null;
        }

        const placeLatLng = new google.maps.LatLng(placeLat, placeLng);

        const distanceInMeters =
            google.maps.geometry.spherical.computeDistanceBetween(
                userLatLng,
                placeLatLng
            );
        const distanceInKilometers = distanceInMeters / 1000;

        return distanceInKilometers.toFixed(2);
    };

    const {
        ready,
        value,
        setValue,
        suggestions: { status, data },
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            location: new window.google.maps.LatLng(14.5995, 120.9842),
            radius: 200 * 1000,
        },
    });

    const handleSelect = async (address) => {
        setValue(address, false);
        clearSuggestions();

        try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            const location = { lat, lng };

            setSelectedLocation(location);
            mapRef.current.panTo(location);
            addMarker(location);

            const service = new window.google.maps.places.PlacesService(
                mapRef.current
            );

            const placeDetails = await new Promise((resolve, reject) => {
                service.getDetails(
                    {
                        placeId: results[0].place_id,
                        fields: [
                            "name",
                            "place_id",
                            "geometry",
                            "formatted_address",
                            "types",
                            "photos",
                        ],
                    },
                    (place, status) => {
                        if (
                            status ===
                            window.google.maps.places.PlacesServiceStatus.OK
                        ) {
                            resolve(place);
                        } else {
                            reject(status);
                        }
                    }
                );
            });

            const accessibilityOptions = await checkPlaceAccessibility(
                placeDetails.place_id
            );

            const isAccessible =
                accessibilityOptions.accessibleEntrance ||
                accessibilityOptions.accessibleParking ||
                accessibilityOptions.accessibleRestroom ||
                accessibilityOptions.accessibleSeating;

            const newPlace = {
                place_id: placeDetails.place_id,
                name: placeDetails.name,
                vicinity: placeDetails.formatted_address,
                geometry: placeDetails.geometry,
                accessible: isAccessible,
                accessibilityOptions,
                distance: calculateDistance(
                    userLocation,
                    placeDetails.geometry.location
                ),
                photos: placeDetails.photos,
            };

            setSearchedPlaces([newPlace]);
            fetchPlaces(location);
        } catch (error) {
            console.error(
                "Error fetching place details or accessibility: ",
                error
            );
        }
    };

    const combinedPlaces = [...(searchedPlaces || []), ...(nearbyPlaces || [])];

    const filteredPlaces = combinedPlaces
        .sort((a, b) => {
            if (a.place_id === searchedPlaces[0]?.place_id) {
                return -1;
            } else if (b.place_id === searchedPlaces[0]?.place_id) {
                return 1;
            } else {
                return sortType === "distance"
                    ? parseFloat(a.distance) - parseFloat(b.distance)
                    : 0;
            }
        })
        .filter(
            (place) =>
                !filterType || (place.types && place.types.includes(filterType))
        );

    return (
        <UserAuthenticatedLayout user={auth.user}>
            <Head title="User Home" />
            <div className="flex flex-col h-screen">
                <div className="flex flex-grow">
                    <div
                        className="w-1/4 bg-gray-100 p-4 overflow-y-auto h-full"
                        style={{ maxHeight: "100vh", overflowY: "auto" }}
                    >
                        <h3 className="font-bold text-lg mb-2">
                            Search for Establishments
                        </h3>
                        <Combobox onSelect={handleSelect}>
                            <ComboboxInput
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                disabled={!ready}
                                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                                placeholder="Search location..."
                            />
                            <ComboboxPopover>
                                {status === "OK" &&
                                    data.map(({ place_id, description }) => (
                                        <ComboboxOption
                                            key={place_id}
                                            value={description}
                                        />
                                    ))}
                            </ComboboxPopover>
                        </Combobox>

                        <div className="mb-4">
                            <label className="block mb-2">
                                Filter by type:
                            </label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="">All Types</option>
                                {availableTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2">Sort by:</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={sortType}
                                onChange={(e) => setSortType(e.target.value)}
                            >
                                <option value="">None</option>
                                <option value="distance">Distance</option>
                            </select>
                        </div>

                        <h3 className="font-bold text-lg mb-2">
                            Nearby Establishments
                        </h3>
                        {filteredPlaces.length === 0 ? (
                            <p>No establishments found.</p>
                        ) : (
                            filteredPlaces.map((place) => (
                                <div
                                    key={place.place_id}
                                    className="border rounded-md p-4 mb-4 shadow-md bg-white"
                                >
                                    <h4 className="font-bold text-lg">
                                        {place.name}
                                    </h4>
                                    {place.photos &&
                                        place.photos.length > 0 && (
                                            <img
                                                src={place.photos[0].getUrl({
                                                    maxWidth: 700,
                                                    maxHeight: 600,
                                                })}
                                                alt={place.name}
                                                className="w-full h-auto rounded-md mb-4"
                                            />
                                        )}
                                    <p className="text-gray-500">
                                        {place.vicinity}
                                    </p>
                                    <p className="text-gray-600 mt-2">
                                        Distance: {place.distance} km
                                    </p>
                                    <p
                                        className={`mt-2 text-sm ${
                                            place.accessible
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {place.accessible
                                            ? "Wheelchair accessible"
                                            : "Not wheelchair accessible"}
                                    </p>
                                    {place.accessible && (
                                        <div className="mt-2">
                                            <h5 className="font-bold">
                                                Accessibility Features:
                                            </h5>
                                            <ul className="list-disc list-inside text-sm">
                                                <li
                                                    className={
                                                        place
                                                            .accessibilityOptions
                                                            .accessibleEntrance
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                    }
                                                >
                                                    {place.accessibilityOptions
                                                        .accessibleEntrance
                                                        ? "Has Wheelchair Accessible Entrance"
                                                        : "No Wheelchair Accessible Entrance"}
                                                </li>
                                                <li
                                                    className={
                                                        place
                                                            .accessibilityOptions
                                                            .accessibleParking
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                    }
                                                >
                                                    {place.accessibilityOptions
                                                        .accessibleParking
                                                        ? "Has Wheelchair Accessible Parking"
                                                        : "No Wheelchair Accessible Parking"}
                                                </li>
                                                <li
                                                    className={
                                                        place
                                                            .accessibilityOptions
                                                            .accessibleRestroom
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                    }
                                                >
                                                    {place.accessibilityOptions
                                                        .accessibleRestroom
                                                        ? "Has Wheelchair Accessible Restroom"
                                                        : "No Wheelchair Accessible Restroom"}
                                                </li>
                                                <li
                                                    className={
                                                        place
                                                            .accessibilityOptions
                                                            .accessibleSeating
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                    }
                                                >
                                                    {place.accessibilityOptions
                                                        .accessibleSeating
                                                        ? "Has Wheelchair Accessible Seating"
                                                        : "No Wheelchair Accessible Seating"}
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2">
                                        Get Directions
                                    </button>
                                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2">
                                        Review
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="w-3/4 relative h-full">
                        <APIProvider
                            googleMapsAPIKey={
                                import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                            }
                        >
                            <Map
                                mapId="18acdc8e78558ba2"
                                defaultZoom={12}
                                center={selectedLocation}
                                style={{ width: "100%", height: "100vh" }}
                            >
                                {filteredPlaces.map((place) => (
                                    <AdvancedMarker
                                        key={place.place_id}
                                        position={{
                                            lat: place.geometry.location.lat(),
                                            lng: place.geometry.location.lng(),
                                        }}
                                        onClick={() => setSelectedPlace(place)}
                                    >
                                        {selectedPlace &&
                                            selectedPlace.place_id ===
                                                place.place_id && (
                                                <InfoWindow
                                                    position={{
                                                        lat: place.geometry.location.lat(),
                                                        lng: place.geometry.location.lng(),
                                                    }}
                                                    onCloseClick={() =>
                                                        setSelectedPlace(null)
                                                    }
                                                >
                                                    <div>
                                                        <img
                                                            src={place.photos[0].getUrl(
                                                                {
                                                                    maxWidth: 400,
                                                                    maxHeight: 300,
                                                                }
                                                            )}
                                                            alt={place.name}
                                                            className="w-full h-auto max-w-full max-h-48 object-contain rounded-md mb-4"
                                                        />
                                                        <h4>{place.name}</h4>
                                                        <p>{place.vicinity}</p>
                                                        <p>
                                                            Distance:{" "}
                                                            {place.distance} km
                                                        </p>
                                                        <h5 className="font-bold mt-2">
                                                            Wheelchair
                                                            Accessibility:
                                                        </h5>
                                                        <li
                                                            className={
                                                                place
                                                                    .accessibilityOptions
                                                                    .accessibleEntrance
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                            }
                                                        >
                                                            {place
                                                                .accessibilityOptions
                                                                .accessibleEntrance
                                                                ? "Is Wheelchair Accessible"
                                                                : "No Wheelchair Accessible Entrance"}
                                                        </li>
                                                    </div>
                                                </InfoWindow>
                                            )}
                                    </AdvancedMarker>
                                ))}
                            </Map>
                        </APIProvider>
                    </div>
                </div>
            </div>
        </UserAuthenticatedLayout>
    );
}
