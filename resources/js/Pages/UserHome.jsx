import { Link, Head } from "@inertiajs/react";
import "css/UserHome.css";
import "css/reviewForm.css";
import { FaStar } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import UserAuthenticatedLayout from "@/Layouts/UserAuthenticatedLayout";
import { useState, useEffect, useRef } from "react";
import { DirectionsRenderer } from "@react-google-maps/api";
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
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ToastContainer, toast } from "react-toastify";
import {
    faVolumeUp,
    faDiamondTurnRight,
} from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function UserHome({ auth }) {
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [searchedPlaces, setSearchedPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [filterType, setFilterType] = useState("");
    const [availableTypes, setAvailableTypes] = useState([]);
    const [sortType, setSortType] = useState("");
    const [userLocation, setUserLocation] = useState(null);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);
    const directionsServiceRef = useRef(null);
    const [directions, setDirections] = useState(null);
    const mapRef = useRef(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [selectedPlaceForReview, setSelectedPlaceForReview] = useState(null);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [image, setImage] = useState(null);
    const [favoritePlaceIds, setFavoritePlaceIds] = useState([]);
    const [bookmarkPlaceIds, setBookmarkPlaceIds] = useState([]);
    const synth = window.speechSynthesis;
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isNearbyPressed, setIsNearbyPressed] = useState(false);
    const { t } = useTranslation();
    const [ziraVoice, setZiraVoice] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [feedbackError, setFeedbackError] = useState("");
    const [ratingError, setRatingError] = useState(false);
    const [imageError, setImageError] = useState("");
    const [showReviewPopup, setShowReviewPopup] = useState(false);
    const [isImageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showComments, setShowComments] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);
    const [commentTexts, setCommentTexts] = useState({});
    const [currentPlaceId, setCurrentPlaceId] = useState(null);
    const [csrfToken, setCsrfToken] = useState(null);
    const [showDirections, setShowDirections] = useState(true);
    const [mapCenter, setMapCenter] = useState(selectedLocation); // Store map center in state
    const [mapInstance, setMapInstance] = useState(null);

    useEffect(() => {
        // Define a function that checks if Google Maps has loaded
        const checkGoogleMaps = () => {
            if (window.google && window.google.maps) {
                initializeMap();
            } else {
                setTimeout(checkGoogleMaps, 100); // Retry every 100ms until Google Maps is available
            }
        };

        // Start checking for Google Maps API availability
        checkGoogleMaps();
    }, []);

    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                const response = await fetch("/csrf-token");
                const data = await response.json();
                if (data.csrfToken) {
                    setCsrfToken(data.csrfToken); // Store CSRF token in state
                    console.log("CSRF Token fetched:", data.csrfToken); // Log the token
                } else {
                    console.error("Failed to fetch CSRF token");
                }
            } catch (error) {
                console.error("Error fetching CSRF token:", error);
            }
        };

        fetchCsrfToken(); // Fetch CSRF token on component mount
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
                    fetchPlaces(location, location); // Pass userLocation as well
                },
                () => {
                    console.error("Geolocation permission denied or failed.");
                    const defaultLocation = { lat: 14.5995, lng: 120.9842 }; // Default location (Manila)
                    setUserLocation(defaultLocation);
                    setSelectedLocation(defaultLocation);
                    initializeGoogleMap(defaultLocation);
                    fetchPlaces(defaultLocation, defaultLocation); // Pass defaultLocation
                },
                {
                    enableHighAccuracy: true, // Ensures the location is as accurate as possible
                    timeout: 30000, // Set the timeout to 30 seconds for more reliable accuracy
                    maximumAge: 0, // Disables cached location to ensure fresh data
                }
            );
        } else {
            console.error("Your browser doesn't support geolocation.");
            const defaultLocation = { lat: 14.5995, lng: 120.9842 }; // Default location (Manila)
            setUserLocation(defaultLocation);
            setSelectedLocation(defaultLocation);
            initializeGoogleMap(defaultLocation);
            fetchPlaces(defaultLocation, defaultLocation); // Pass defaultLocation
        }
    };

    const initializeGoogleMap = (location) => {
        const mapContainer = document.getElementById("mapContainer");
        const map = new window.google.maps.Map(document.createElement("div"), {
            center: location,
            zoom: 12,
        });
        mapRef.current = map;
        addMarker(location);
    };

    const checkReviewID = (review) => {
        console.log(review.id);
        fetchComments(review.id);
    };

    const fetchPlaces = async (location, userLocation) => {
        if (!mapRef.current) {
            console.error("Map is not initialized yet.");
            return;
        }

        const { Place } = await google.maps.importLibrary("places");
        const service = new window.google.maps.places.PlacesService(
            mapRef.current
        );
        const request = {
            location,
            radius: 800, // Reduced radius for fewer initial results
        };

        try {
            const results = await new Promise((resolve, reject) => {
                service.nearbySearch(request, (res, status) => {
                    if (
                        status ===
                        window.google.maps.places.PlacesServiceStatus.OK
                    ) {
                        resolve(res.slice(0, 10)); // Limit to top 5 results
                    } else {
                        reject(status);
                    }
                });
            });

            const accessiblePlaces = await Promise.all(
                results.map(async (place) => {
                    const distance = calculateDistance(
                        userLocation,
                        place.geometry.location
                    );

                    // Check accessibility only for closer places
                    const accessibilityOptions = await checkPlaceAccessibility(
                        place.place_id
                    );

                    if (
                        accessibilityOptions.accessibleEntrance ||
                        accessibilityOptions.accessibleParking ||
                        accessibilityOptions.accessibleRestroom ||
                        accessibilityOptions.accessibleSeating
                    ) {
                        const marker = new window.google.maps.Marker({
                            map: mapRef.current,
                            position: place.geometry.location,
                            title: place.name,
                        });

                        return {
                            ...place,
                            accessible: true,
                            distance: distance,
                            accessibilityOptions,
                        };
                    }
                    return null;
                })
            );

            const filteredPlaces = accessiblePlaces.filter(Boolean);
            setNearbyPlaces(filteredPlaces);
            updateAvailableTypes(filteredPlaces);
        } catch (error) {
            console.error("Error fetching places:", error);
        }
    };

    const openImageModal = (imagePath) => {
        setSelectedImage(imagePath);
        setImageModalOpen(true);
    };

    const closeImageModal = () => {
        setImageModalOpen(false);
        setSelectedImage(null);
    };

    const fetchComments = async (reviewId) => {
        try {
            const response = await axios.get(`reviews/${reviewId}/comments`);
            setComments(response.data.comments);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const handleAddComment = async (reviewId) => {
        const comment = commentTexts[reviewId]?.trim();

        if (!comment) {
            toast.warn("Please write a comment.");
            return;
        }

        try {
            const response = await axios.post(`/reviews/${reviewId}/comments`, {
                review_id: reviewId,
                comment: comment,
            });

            // Add the newly added comment to the local state
            setComments((prevComments) => [
                ...prevComments,
                {
                    user: { name: "You" }, // Assuming the current user is always the one commenting
                    comment: comment,
                    created_at: new Date().toLocaleString(), // You can adjust this to match your backend format
                },
            ]);

            // Clear the specific review's comment text after submission
            setCommentTexts((prev) => ({
                ...prev,
                [reviewId]: "", // Reset the comment text for the specific review
            }));
        } catch (error) {
            console.error(
                "There was an error adding the comment:",
                error.response?.data || error.message
            );
            toast.warn("Your comment must be at least 5 characters.");
        }
    };

    const handleCommentChange = (reviewId, e) => {
        setCommentTexts((prevState) => ({
            ...prevState,
            [reviewId]: e.target.value,
        }));
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

    const handleReviewClick = (place) => {
        setSelectedPlaceForReview(place);
        setShowReviewForm(true);
    };

    const handleViewReviewClick = async (place) => {
        setSelectedPlaceForReview(place); // Set the selected place
        setShowReviewPopup(true); // Open the popup

        try {
            const response = await axios.get(`/reviews/${place.place_id}`);
            setReviews(response.data); // Assuming setReviews is used to manage review data in the state
        } catch (error) {
            console.error("Error fetching reviews:", error);
            setReviews([]); // Fallback to an empty array if there's an error
        }
    };

    const handleStarClick = (value) => {
        setRating(value);
    };

    const handleFeedbackChange = (e) => setFeedback(e.target.value);
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

        if (file && !allowedTypes.includes(file.type)) {
            setImageError(
                "Invalid file type. Please upload a JPG, JPEG, or PNG file type."
            );
            setImage(null); // Clear the selected file
            return;
        }

        setImageError(""); // Clear error if file type is valid
        setImage(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation for star rating
        if (rating === 0) {
            toast.error(
                "Please select a star rating before submitting your review."
            );
            return; // Stop further execution
        }

        // Validation for feedback length
        if (feedback.length < 20) {
            toast.error("Your review must be at least 20 characters.");
            return; // Stop further execution
        }

        if (feedback.length > 500) {
            toast.error("Your review must be no more than 500 characters.");
            return; // Stop further execution
        }

        // Validation for image errors
        if (imageError) {
            toast.error(
                "Please resolve the image upload issue before submitting."
            );
            return; // Stop further execution
        }

        try {
            if (!csrfToken) {
                toast.error(
                    "A security issue occurred. Please refresh and try again."
                );
                return; // Stop further execution if no CSRF token
            }

            // Prepare form data
            if (!selectedPlaceForReview || !selectedPlaceForReview.place_id) {
                toast.warn(
                    "Place ID is missing. Please select a place to review."
                );
                return; // Stop further execution if place is not selected
            }

            const formData = new FormData();
            formData.append("placeid", selectedPlaceForReview.place_id);
            formData.append("rating", rating);
            formData.append("feedback", feedback);

            if (image) {
                formData.append("image", image);
            }

            const response = await fetch("/submit-review", {
                method: "POST",
                body: formData,
                headers: {
                    "X-CSRF-TOKEN": csrfToken, // Use the CSRF token from state
                    Accept: "application/json",
                },
            });

            if (response.ok) {
                const result = await response.json();
                toast.success(
                    "Review submitted successfully! Awaiting admin review."
                );

                // Reset form state
                setRating(0);
                setFeedback("");
                setImage(null);
                setShowReviewForm(false);
            } else {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorResponse = await response.json();
                    toast.error(errorResponse.message || "An error occurred.");
                    console.log(errorResponse);
                } else {
                    const errorText = await response.text();
                    toast.error("There was an issue submitting your review.");
                }
            }
        } catch (error) {
            toast.error(`An error occurred: ${error.message}`);
            console.log(error.message);
        }
    };
    const handleBookmarkClick = async (place) => {
        const placeId = place.place_id;

        // Fetch CSRF token dynamically
        if (!csrfToken) {
            console.error("CSRF token is missing");
            toast.error("CSRF token is missing. Please refresh the page.");
            return;
        }

        // Prevent duplicate bookmark on the client side
        if (bookmarkPlaceIds.includes(placeId)) {
            toast.warn("This place is already bookmarked.");
            return;
        }

        try {
            const response = await fetch("/add-bookmark", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken, // CSRF token from state
                },
                body: JSON.stringify({ placeId }),
            });

            if (response.ok) {
                const result = await response.json();
                setBookmarkPlaceIds((prev) => [...prev, placeId]); // Add to state if successful
                toast.success(
                    result.message || "Place bookmarked successfully!"
                );
            } else {
                const errorData = await response.json();
                if (errorData.message === "This place is already bookmarked") {
                    toast.warn(errorData.message); // Show warning for duplicate
                } else {
                    toast.error(
                        "Failed to add to bookmarks. Please try again."
                    );
                }
            }
        } catch (error) {
            console.error("Error adding bookmark:", error);
            toast.error(`An error occurred: ${error.message}`);
        }
    };

    const handleFavoriteClick = async (place) => {
        const placeId = place.place_id;

        // Fetch CSRF token dynamically
        if (!csrfToken) {
            console.error("CSRF token is missing");
            toast.error("CSRF token is missing. Please refresh the page.");
            return;
        }

        // Prevent duplicate favorite on the client side
        if (favoritePlaceIds.includes(placeId)) {
            toast.warn("This place is already in your favorites.");
            return;
        }

        try {
            const response = await fetch("/add-favorite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken, // CSRF token from state
                },
                body: JSON.stringify({ placeId }),
            });

            if (response.ok) {
                const result = await response.json();
                setFavoritePlaceIds((prev) => [...prev, placeId]); // Add to state if successful
                toast.success(result.message || "Place added to favorites.");
            } else {
                const errorData = await response.json();
                if (
                    errorData.message ===
                    "This place is already in your favorites"
                ) {
                    toast.warn(errorData.message);
                } else {
                    toast.error(
                        "Failed to add to favorites. Please try again."
                    );
                }
            }
        } catch (error) {
            console.error("Error adding favorite:", error);
            toast.error(`An error occurred: ${error.message}`);
        }
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

    const checkIfOutsideMetroManila = (location) => {
        const metroManilaBounds = {
            north: 14.9009,
            south: 14.1949,
            east: 121.1746,
            west: 120.938,
        };

        return (
            location.lat > metroManilaBounds.north ||
            location.lat < metroManilaBounds.south ||
            location.lng > metroManilaBounds.east ||
            location.lng < metroManilaBounds.west
        );
    };

    const handleSelect = async (address) => {
        try {
            // If the selected address is the same as the current value, do nothing
            if (value === address) {
                console.log("Same address selected, skipping re-processing.");
                return;
            }

            // Update the value and clear suggestions
            setValue(address, false);
            clearSuggestions();

            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            const location = { lat, lng };

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

            // Check if the location is outside Metro Manila
            const isOutsideMetroManila = await checkIfOutsideMetroManila(
                location
            ); // Implement this utility function
            if (isOutsideMetroManila) {
                toast.warn(
                    "The location you selected is outside Metro Manila. Our current scope is limited to Metro Manila, so you may encounter unexpected behavior."
                );
            }

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

            // Batch state updates
            setSelectedLocation(location);
            setSearchedPlaces([newPlace]);

            // Update the map and add markers
            mapRef.current.panTo(location);
            addMarker(location);

            // Fetch other places nearby
            fetchPlaces(location, userLocation);
        } catch (error) {
            console.error(
                "Error fetching place details or accessibility: ",
                error
            );
        }
    };

    const combinedPlaces = [...(searchedPlaces || []), ...(nearbyPlaces || [])];

    // Utility function to convert strings to Title Case
    const toTitleCase = (str) =>
        str
            .split("_") // In case there are underscores in the type names
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ");

    // Process the places and apply filters
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
        .filter((place) => {
            // Check if the place matches the selected filter type
            const formattedTypes = place.types?.map(toTitleCase) || [];
            return !filterType || formattedTypes.includes(filterType);
        });

    const formattedTypes = availableTypes.map(toTitleCase);

    const Directions = ({ place }) => {
        const map = useMap();
        const directionsRendererRef = useRef(null); // Store directionsRenderer in a ref
        const [directionsService, setDirectionsService] = useState(null);
        const [routes, setRoutes] = useState([]);
        const [routeIndex, setRouteIndex] = useState(0);
        const [travelMode, setTravelMode] = useState(
            google?.maps?.TravelMode?.DRIVING || null
        );
        const destination = place?.geometry?.location;
        const selected = routes[routeIndex];
        const leg = selected?.legs ? selected.legs[0] : null;
        const navigate = useNavigate();

        // Initialize DirectionsService and DirectionsRenderer only after google.maps is fully available
        useEffect(() => {
            if (!google || !google.maps || !map) return;

            const service = new google.maps.DirectionsService();
            const renderer = new google.maps.DirectionsRenderer({
                map,
                polylineOptions: {
                    strokeColor: "#FF0000",
                    strokeWeight: 5,
                },
            });

            directionsRendererRef.current = renderer;
            setDirectionsService(service);

            // Cleanup on component unmount
            return () => {
                if (renderer) {
                    renderer.setMap(null);
                }
            };
        }, [map]);

        useEffect(() => {
            if (
                !directionsService ||
                !directionsRendererRef.current ||
                !destination
            )
                return;

            // Request new routes
            directionsService
                .route({
                    origin: userLocation,
                    destination: destination,
                    travelMode: travelMode,
                    provideRouteAlternatives: true,
                })
                .then((response) => {
                    directionsRendererRef.current.setDirections(response);
                    setRoutes(response.routes); // Update routes
                })
                .catch((error) =>
                    console.error("Directions request failed", error)
                );

            // Cleanup previous directions when destination changes
            return () => {
                if (directionsRendererRef.current) {
                    directionsRendererRef.current.setDirections({ routes: [] });
                }
            };
        }, [directionsService, destination, travelMode]);

        const handleTravelModeChange = (mode) => {
            // Only update the state if the mode is different from the current mode
            if (mode !== travelMode) {
                setRoutes([]); // Clear the current routes
                setRouteIndex(0); // Reset the route index
                setTravelMode(mode); // Set the new travel mode
            }
        };

        const handleCancel = () => {
            if (directionsRendererRef.current) {
                directionsRendererRef.current.setMap(null); // Detach the renderer
                directionsRendererRef.current = null; // Clear the reference
            }
            setRoutes([]); // Clear routes
            setRouteIndex(0); // Reset index
            setSelectedPlace(null); // Clear selected place
            setValue(""); // Clear search input or query
            navigate(location.pathname); // Clear URL query
        };

        const setRouteIndexAndUpdate = (index) => {
            setRouteIndex(index); // Update the routeIndex state
            if (directionsRendererRef.current) {
                directionsRendererRef.current.setRouteIndex(index); // Update the directions renderer with the new route index
            }
        };

        // Ensure routeIndex is set on directionsRenderer when it changes
        useEffect(() => {
            if (directionsRendererRef.current && routes.length > 0) {
                directionsRendererRef.current.setRouteIndex(routeIndex);
            }
        }, [routeIndex, routes]);

        if (!leg) return null;

        return (
            showDirections && (
                <div className="directions">
                    <h2>{selected.summary}</h2>
                    <p className="blue-background-text">
                        {leg.start_address.split(/\/|,/)[0]} {t("userhome.to")}{" "}
                        {leg.end_address.split(/[,/]/)[0]}
                    </p>
                    <p className="blue-background-text">
                        {t("userhome.distance")}: {leg.distance?.text}
                    </p>
                    <p className="blue-background-text">
                        {t("userhome.duration")}: {leg.duration?.text}
                    </p>

                    <h3>{t("userhome.select_travel_mode")}</h3>
                    <div>
                        <button
                            onClick={() =>
                                handleTravelModeChange(
                                    google?.maps?.TravelMode?.DRIVING ||
                                        "DRIVING"
                                )
                            }
                        >
                            {t("userhome.driving")}
                        </button>
                        <button
                            onClick={() =>
                                handleTravelModeChange(
                                    google?.maps?.TravelMode?.WALKING ||
                                        "WALKING"
                                )
                            }
                        >
                            {t("userhome.walking")}
                        </button>
                    </div>

                    <h2>{t("userhome.other_routes")}</h2>
                    <ul>
                        {routes.map((route, index) => (
                            <li key={route.summary}>
                                <button
                                    onClick={() =>
                                        setRouteIndexAndUpdate(index)
                                    }
                                >
                                    {route.summary}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <h3>{t("userhome.cancel_directions")}</h3>
                    <button onClick={handleCancel} className="cancel-button">
                        {t("userhome.cancel")}
                    </button>
                </div>
            )
        );
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const placeId = params.get("place_id");

        if (placeId) {
            fetchPlaceDetails(placeId).then((place) => {
                if (place) {
                    console.log("selecting place");
                    setSelectedPlace(place);

                    // Clear the `place_id` from the URL immediately
                    window.history.replaceState(null, "", location.pathname);
                }
            });
        }
    }, [location.search, setSelectedPlace]);

    const fetchPlaceDetails = (placeId) => {
        return new Promise((resolve, reject) => {
            const placesService = new window.google.maps.places.PlacesService(
                document.createElement("div")
            );

            const request = {
                placeId,
                fields: ["geometry", "name", "vicinity"],
            };

            placesService.getDetails(request, (place, status) => {
                if (
                    status === window.google.maps.places.PlacesServiceStatus.OK
                ) {
                    resolve(place);
                } else {
                    console.error("Error fetching place details:", status);
                    reject(status);
                }
            });
        });
    };

    const speakPlaceDetails = (place) => {
        const synth = window.speechSynthesis;

        if (synth.speaking) {
            synth.cancel();
            setIsSpeaking(false);
            setIsPressed(false);
            setIsNearbyPressed(false);
            return;
        }
        setIsPressed(true);
        setIsSpeaking(true);

        const accessibilityText = `${
            place.accessibilityOptions.accessibleEntrance
                ? "This place has an accessible entrance."
                : "This place does not have an accessible entrance."
        } ${
            place.accessibilityOptions.accessibleParking
                ? "Accessible parking is available."
                : "There is no accessible parking."
        } ${
            place.accessibilityOptions.accessibleRestroom
                ? "There is an accessible restroom."
                : "There is no accessible restroom."
        } ${
            place.accessibilityOptions.accessibleSeating
                ? "Accessible seating is available."
                : "There is no seating available."
        }`;

        const text = `@ ${place.name}. Located at ${place.vicinity}. ${
            place.accessible
                ? "This place is wheelchair accessible."
                : "This place is not wheelchair accessible."
        } ${accessibilityText}`;

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = synth.getVoices();
        const ziraVoice = voices.find(
            (voice) => voice.name === "Microsoft Zira - English (United States)"
        );

        if (ziraVoice) {
            utterance.voice = ziraVoice;
        } else {
            console.warn(
                "Microsoft Zira voice not found. Using default voice."
            );
        }

        utterance.rate = 1;
        setTimeout(() => synth.speak(utterance), 50);
    };

    useEffect(() => {
        const synth = window.speechSynthesis;

        // Load voices and find Zira voice
        const loadVoices = () => {
            const voices = synth.getVoices();
            const voice = voices.find(
                (voice) =>
                    voice.name === "Microsoft Zira - English (United States)"
            );
            setZiraVoice(voice);
        };

        // Set up the voiceschanged listener to load voices if not already loaded
        synth.onvoiceschanged = loadVoices;
        loadVoices(); // Call initially in case voices are already available
    }, []);

    const handleSpeakEstablishments = () => {
        if (searchedPlaces.length > 0) {
            speakNearbyAccessibleEstablishments([
                ...searchedPlaces,
                ...nearbyPlaces,
            ]);
        } else {
            speakNearbyAccessibleEstablishments(nearbyPlaces);
        }
    };

    const speakNearbyAccessibleEstablishments = async (places) => {
        const synth = window.speechSynthesis;

        if (synth.speaking) {
            synth.cancel();
            setIsSpeaking(false);
            setIsNearbyPressed(false);
            setIsPressed(false);
            return;
        }

        synth.cancel();
        setIsSpeaking(true);
        setIsNearbyPressed(true);

        const accessiblePlaces = places.filter((place) => place.accessible);

        if (accessiblePlaces.length === 0) {
            const utterance = new SpeechSynthesisUtterance(
                "No wheelchair accessible establishments nearby."
            );
            utterance.rate = 1;

            const voices = synth.getVoices();
            const ziraVoice = voices.find(
                (voice) =>
                    voice.name === "Microsoft Zira - English (United States)"
            );

            if (ziraVoice) {
                utterance.voice = ziraVoice;
            }

            synth.speak(utterance);
            setIsSpeaking(false);
            setIsNearbyPressed(false);
            return;
        }

        const voices = synth.getVoices();
        const ziraVoice = voices.find(
            (voice) => voice.name === "Microsoft Zira - English (United States)"
        );

        for (const place of accessiblePlaces) {
            const text = `@ ${place.name}.  This place is wheelchair accessible. `;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;

            if (ziraVoice) {
                utterance.voice = ziraVoice;
            }

            await new Promise((resolve) => {
                utterance.onend = () => {
                    resolve();
                    setIsSpeaking(false);
                };
                synth.speak(utterance);
            });
        }
    };

    window.speechSynthesis.onvoiceschanged = () => {
        speakNearbyAccessibleEstablishments(places);
    };

    const [isHovered, setIsHovered] = useState(false);
    const [isHoveredReviews, setIsHoveredReviews] = useState(false);
    const [isHoveredReview, setIsHoveredReview] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true); // Sidebar is shown by default

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar); // Toggle the sidebar visibility
    };

    return (
        <UserAuthenticatedLayout user={auth.user}>
            <Head title={t("userhome.header")} />
            <div className="userhome-body">
                <div className="flex-column">
                    <div className="flex-container">
                        {showSidebar && (
                            <div
                                className={`sidebar-container ${
                                    showSidebar
                                        ? "show-sidebar"
                                        : "hide-sidebar"
                                }`}
                            >
                                <div
                                    className="sidebar-icon-mobile"
                                    onClick={toggleSidebar}
                                >
                                    <GiHamburgerMenu />
                                </div>
                                <h3 className="search-header">
                                    {t("userhome.search_establishments")}
                                </h3>
                                <div className="relative w-full">
                                    <Combobox onSelect={handleSelect}>
                                        <div className="relative">
                                            {/* Combobox input field */}
                                            <ComboboxInput
                                                value={value}
                                                onChange={(e) =>
                                                    setValue(e.target.value)
                                                }
                                                disabled={!ready}
                                                className="combobox-input"
                                                placeholder={t(
                                                    "userhome.search_location_placeholder"
                                                )}
                                                style={{
                                                    paddingRight: "3rem", // Add padding to avoid text overlap with the button
                                                }}
                                            />

                                            {/* Clear button */}
                                            {value && (
                                                <button
                                                    onClick={() => setValue("")}
                                                    className="clear-button"
                                                    aria-label="Clear search"
                                                    style={{
                                                        right: "13px", // Position button with a gap from the right edge
                                                        top: "33%",
                                                        transform:
                                                            "translateY(-50%)",
                                                        fontSize: "1.5rem",
                                                    }}
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </div>

                                        {/* Combobox popover for search results */}
                                        <ComboboxPopover>
                                            {status === "OK" &&
                                                data.map(
                                                    ({
                                                        place_id,
                                                        description,
                                                    }) => (
                                                        <ComboboxOption
                                                            key={place_id}
                                                            value={description}
                                                        />
                                                    )
                                                )}
                                        </ComboboxPopover>
                                    </Combobox>
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2">
                                        {t("userhome.filter_by_type")}
                                    </label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        value={filterType}
                                        onChange={(e) =>
                                            setFilterType(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            {t("userhome.all_types")}
                                        </option>
                                        {formattedTypes.map((type, index) => (
                                            <option key={index} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sort-container">
                                    <label className="sort-element">
                                        {t("userhome.sort_by")}
                                    </label>
                                    <select
                                        className="sort-element-2"
                                        value={sortType}
                                        onChange={(e) =>
                                            setSortType(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            {t("userhome.none")}
                                        </option>
                                        <option value="distance">
                                            {t("userhome.distance")}
                                        </option>
                                    </select>
                                </div>

                                <div className="nearby-estb-container">
                                    <h3 className="nearby-estb-header">
                                        {t("userhome.nearby_establishments")}
                                    </h3>

                                    <button
                                        className="nearby-speaker"
                                        onClick={handleSpeakEstablishments}
                                    >
                                        <FontAwesomeIcon
                                            icon={faVolumeUp}
                                            className={
                                                isNearbyPressed
                                                    ? "text-blue-900"
                                                    : "text-white"
                                            }
                                        />
                                    </button>
                                </div>
                                {filteredPlaces.length === 0 ? (
                                    <p>
                                        {t("userhome.no_establishments_found")}
                                    </p>
                                ) : (
                                    filteredPlaces.map((place) => (
                                        <div
                                            key={place.place_id}
                                            className="estb-card-container"
                                        >
                                            <div className="estb-header-container">
                                                <h4 className="estb-header-name">
                                                    {place.name}
                                                </h4>
                                                <button
                                                    className="estb-details-speaker"
                                                    onClick={() =>
                                                        speakPlaceDetails(place)
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faVolumeUp}
                                                        className={
                                                            isPressed
                                                                ? "text-blue-900"
                                                                : "text-white"
                                                        }
                                                    />
                                                </button>
                                            </div>

                                            {place.photos &&
                                                place.photos.length > 0 && (
                                                    <img
                                                        src={place.photos[0].getUrl(
                                                            {
                                                                maxWidth: 700,
                                                                maxHeight: 600,
                                                            }
                                                        )}
                                                        alt={place.name}
                                                        className="estb-photos"
                                                    />
                                                )}
                                            <p className="estb-photo-p">
                                                {place.vicinity}
                                            </p>

                                            <p
                                                className={`place-accesibility-details ${
                                                    place.accessible
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                }`}
                                            >
                                                {place.accessible
                                                    ? t(
                                                          "userhome.wheelchair_accessible"
                                                      )
                                                    : t(
                                                          "userhome.not_wheelchair_accessible"
                                                      )}
                                            </p>
                                            {place.accessible && (
                                                <div className="place-accesbility-features-container">
                                                    <h5 className="place-accesbility-features-header">
                                                        {t(
                                                            "userhome.accessibility_features"
                                                        )}
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
                                                            {place
                                                                .accessibilityOptions
                                                                .accessibleEntrance
                                                                ? t(
                                                                      "userhome.accessible_entrance"
                                                                  )
                                                                : t(
                                                                      "userhome.no_accessible_entrance"
                                                                  )}
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
                                                            {place
                                                                .accessibilityOptions
                                                                .accessibleParking
                                                                ? t(
                                                                      "userhome.accessible_parking"
                                                                  )
                                                                : t(
                                                                      "userhome.no_accessible_parking"
                                                                  )}
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
                                                            {place
                                                                .accessibilityOptions
                                                                .accessibleRestroom
                                                                ? t(
                                                                      "userhome.accessible_restroom"
                                                                  )
                                                                : t(
                                                                      "userhome.no_accessible_restroom"
                                                                  )}
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
                                                            {place
                                                                .accessibilityOptions
                                                                .accessibleSeating
                                                                ? t(
                                                                      "userhome.accessible_seating"
                                                                  )
                                                                : t(
                                                                      "userhome.no_accessible_seating"
                                                                  )}
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}
                                            <div className="place-btn-container">
                                                <div className="parent-container">
                                                    <button
                                                        className="place-btn"
                                                        style={{
                                                            backgroundColor:
                                                                isHovered
                                                                    ? "#002C80"
                                                                    : "#0038A7", // Change background color on hover
                                                        }}
                                                        onClick={() =>
                                                            setSelectedPlace(
                                                                place
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-map-marker-alt"></i>{" "}
                                                        {t(
                                                            "userhome.get_directions"
                                                        )}
                                                    </button>

                                                    <button
                                                        className="place-btn"
                                                        style={{
                                                            backgroundColor:
                                                                isHoveredReviews
                                                                    ? "#002C80"
                                                                    : "#0038A7",
                                                        }}
                                                        onClick={() => [
                                                            handleViewReviewClick(
                                                                place
                                                            ),
                                                        ]}
                                                    >
                                                        <i className="fas fa-comments"></i>{" "}
                                                        {t(
                                                            "userhome.viewreview"
                                                        )}
                                                    </button>

                                                    <button
                                                        className="place-btn"
                                                        style={{
                                                            backgroundColor:
                                                                isHoveredReview
                                                                    ? "#002C80"
                                                                    : "#0038A7", // Hover effect
                                                        }}
                                                        onClick={() =>
                                                            handleReviewClick(
                                                                place
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-pencil-alt"></i>{" "}
                                                        {t("userhome.review")}
                                                    </button>

                                                    <div className="icon-btn-container">
                                                        <button
                                                            className="heart-icon"
                                                            onClick={() =>
                                                                handleFavoriteClick(
                                                                    place
                                                                )
                                                            }
                                                        >
                                                            <i className="fas fa-heart"></i>
                                                        </button>
                                                        <button
                                                            className="bookmark-icon"
                                                            onClick={() =>
                                                                handleBookmarkClick(
                                                                    place
                                                                )
                                                            }
                                                        >
                                                            <i className="fas fa-bookmark"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        <div
                            className={`maps-container ${
                                showSidebar ? "show-sidebar" : ""
                            }`}
                        >
                            {/* Sidebar Hamburger Icon */}
                            <div
                                className="sidebar-icon"
                                onClick={toggleSidebar}
                            >
                                <GiHamburgerMenu />
                            </div>

                            <div
                                className="directions-btn"
                                onClick={() =>
                                    setShowDirections(!showDirections)
                                }
                            >
                                <FontAwesomeIcon icon={faDiamondTurnRight} />
                            </div>

                            <APIProvider
                                googleMapsAPIKey={
                                    "AIzaSyB7s_wnGHNh4BKaeiuEOOL6qSc_bvwv7nA"
                                }
                                libraries={["places", "geometry"]}
                            >
                                <Map
                                    mapId="18acdc8e78558ba2"
                                    defaultZoom={12}
                                    center={selectedLocation}
                                    style={{ width: "100%", height: "100vh" }}
                                    fullscreenControl={false}
                                    options={{
                                        streetViewControl: false,
                                        mapTypeControl: false, // Hides map type control
                                        zoomControl: true, // Enable zoom controls
                                        keyboardShortcuts: false,
                                        // Default is true

                                        zoomControlOptions: {
                                            position:
                                                google.maps.ControlPosition
                                                    .RIGHT_TOP, // Place on the right side
                                        },
                                    }}
                                >
                                    {selectedPlace && (
                                        <Directions place={selectedPlace} />
                                    )}
                                    {filteredPlaces.map((place) => (
                                        <AdvancedMarker
                                            key={place.place_id}
                                            position={{
                                                lat: place.geometry.location.lat(),
                                                lng: place.geometry.location.lng(),
                                            }}
                                        />
                                    ))}
                                </Map>
                            </APIProvider>
                        </div>
                    </div>

                    {showReviewForm && (
                        <div className="review-container">
                            <div className="review-form">
                                <h3>
                                    {t("userhome.review_place", {
                                        place: selectedPlaceForReview?.name,
                                    })}
                                </h3>
                                <div
                                    className={`star-rating ${
                                        ratingError
                                            ? "border border-red-500 rounded-md p-2"
                                            : ""
                                    }`}
                                >
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <FaStar
                                            key={value}
                                            onClick={() => {
                                                setRating(value);
                                                setRatingError(false); // Clear error when a star is selected
                                            }}
                                            className={`star ${
                                                value <= rating ? "filled" : ""
                                            } ${
                                                ratingError
                                                    ? "text-red-500"
                                                    : ""
                                            }`}
                                        />
                                    ))}
                                </div>
                                {ratingError && (
                                    <p className="rating-error-p">
                                        Please select a star rating before
                                        submitting your review.
                                    </p>
                                )}
                                <textarea
                                    className={`feedback-container ${
                                        feedbackError
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    } rounded-md mb-4`}
                                    value={feedback}
                                    onChange={(e) => {
                                        setFeedback(e.target.value);
                                        if (
                                            e.target.value.length >= 20 &&
                                            e.target.value.length <= 500
                                        ) {
                                            setFeedbackError(""); // Clear error when input is valid
                                        }
                                    }}
                                    placeholder="Write your review (20-500 characters)..."
                                    maxLength={500}
                                />
                                {feedbackError && (
                                    <p className="text-red-500 mb-2">
                                        {feedbackError}
                                    </p>
                                )}
                                <div>
                                    <label>{t("userhome.image")}</label>
                                    <input
                                        type="file"
                                        onChange={handleImageChange}
                                    />
                                    {imageError && (
                                        <p className="text-red-500 mb-2">
                                            {imageError}
                                        </p>
                                    )}
                                </div>
                                <button
                                    className="review-btn-submit"
                                    onClick={async (e) => {
                                        e.preventDefault();

                                        handleSubmit(e);
                                    }}
                                >
                                    {t("userhome.submit")}
                                </button>
                                <button
                                    className="review-btn-cancel"
                                    onClick={() => setShowReviewForm(false)}
                                >
                                    {t("userhome.cancel")}
                                </button>
                            </div>
                        </div>
                    )}

                    {showReviewPopup && (
                        <div className="view-review-overlay">
                            <div className="view-review-card-container">
                                <h3 className="view-review-placename">
                                    {t("userhome.view_review_for", {
                                        place: selectedPlaceForReview?.name,
                                    })}
                                </h3>
                                <div className="view-review-container">
                                    {reviews.length > 0 ? (
                                        reviews.map((review, index) => (
                                            <div
                                                key={index}
                                                className="border-b py-4"
                                            >
                                                <div className="view-reviewer-details">
                                                    <p className="view-reviewer-details2">
                                                        {review.user.name}
                                                    </p>
                                                    <p className="view-reviewer-star">
                                                        {"★".repeat(
                                                            review.rating
                                                        )}
                                                    </p>
                                                </div>
                                                <p className="view-reviewer-date">
                                                    {new Date(
                                                        review.created_at
                                                    ).toLocaleString("en-US", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        second: "2-digit",
                                                        hour12: true,
                                                    })}
                                                </p>
                                                <div className="divider">
                                                    <hr />
                                                </div>
                                                <p className="comment-p">
                                                    {review.feedback}
                                                </p>
                                                {review.imagepath && (
                                                    <div
                                                        className="view-review-image-container"
                                                        onClick={() =>
                                                            openImageModal(
                                                                review.imagepath
                                                            )
                                                        }
                                                    >
                                                        <img
                                                            src={`/${review.imagepath}`}
                                                            alt="Review Image"
                                                            className="view-review-image-container img"
                                                        />
                                                    </div>
                                                )}

                                                {/* Comments Section */}
                                                <div className="comments-container">
                                                    <h4 className="comments-container-header">
                                                        {t("userhome.comments")}
                                                    </h4>
                                                    <button
                                                        className="comments-container-show-btn"
                                                        onClick={() => {
                                                            if (
                                                                showComments ===
                                                                index
                                                            ) {
                                                                setShowComments(
                                                                    null
                                                                ); // Hide comments
                                                            } else {
                                                                setShowComments(
                                                                    index
                                                                ); // Show comments for this review
                                                                fetchComments(
                                                                    review.id
                                                                ); // Fetch comments for this review
                                                            }
                                                        }}
                                                    >
                                                        {showComments === index
                                                            ? t(
                                                                  "userhome.hide_comments"
                                                              )
                                                            : t(
                                                                  "userhome.show_comments"
                                                              )}
                                                    </button>

                                                    {/* Display Comments */}
                                                    {showComments === index &&
                                                    comments.length > 0
                                                        ? comments.map(
                                                              (
                                                                  comment,
                                                                  commentIndex
                                                              ) => (
                                                                  <div
                                                                      key={
                                                                          commentIndex
                                                                      }
                                                                      className="border-t py-4"
                                                                  >
                                                                      <div className="commenter-username">
                                                                          <p className="commenter-username p">
                                                                              {
                                                                                  comment
                                                                                      .user
                                                                                      .name
                                                                              }
                                                                          </p>
                                                                      </div>
                                                                      <p className="commenter-date">
                                                                          {new Date(
                                                                              comment.created_at
                                                                          ).toLocaleString(
                                                                              "en-US",
                                                                              {
                                                                                  year: "numeric",
                                                                                  month: "short",
                                                                                  day: "numeric",
                                                                                  hour: "2-digit",
                                                                                  minute: "2-digit",
                                                                                  second: "2-digit",
                                                                                  hour12: true,
                                                                              }
                                                                          )}
                                                                      </p>
                                                                      <p className="commenter-p2">
                                                                          {
                                                                              comment.comment
                                                                          }
                                                                      </p>
                                                                  </div>
                                                              )
                                                          )
                                                        : showComments ===
                                                              index && (
                                                              <p>
                                                                  {t(
                                                                      "userhome.no_comments"
                                                                  )}
                                                              </p>
                                                          )}
                                                </div>

                                                {/* Add Comment Text Area */}
                                                <div className="comment-section">
                                                    <textarea
                                                        className="comment-textarea"
                                                        rows="3"
                                                        value={
                                                            commentTexts[
                                                                review.id
                                                            ] || ""
                                                        } // Use the specific review's comment text
                                                        onChange={(e) =>
                                                            handleCommentChange(
                                                                review.id,
                                                                e
                                                            )
                                                        } // Update the corresponding review's comment text
                                                        placeholder={t(
                                                            "userhome.write_comment"
                                                        )}
                                                    />
                                                    <button
                                                        className="comment-button"
                                                        onClick={() =>
                                                            handleAddComment(
                                                                review.id
                                                            )
                                                        }
                                                    >
                                                        {t(
                                                            "userhome.add_comment"
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p>{t("userhome.no_reviews")}</p>
                                    )}
                                </div>
                                <button
                                    className="close-comment-btn"
                                    onClick={() => setShowReviewPopup(false)}
                                >
                                    {t("userhome.close")}
                                </button>
                            </div>
                        </div>
                    )}

                    {isImageModalOpen && selectedImage && (
                        <div className="modal-overlay">
                            <div className="modal-card">
                                <button
                                    className="close-modal"
                                    onClick={closeImageModal}
                                >
                                    &times;
                                </button>
                                <img
                                    src={`/${selectedImage}`}
                                    alt="Full Review Image"
                                    className="max-w-full h-auto"
                                />
                            </div>
                        </div>
                    )}

                    <ToastContainer />
                </div>
            </div>
        </UserAuthenticatedLayout>
    );
}
// merge
