import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/UserAuthenticatedLayout";
import { Head } from "@inertiajs/react";
import "css/Favorites.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";


export default function Favorites({ auth }) {
    const { t } = useTranslation();
    const [favorites, setFavorites] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filledIcons, setFilledIcons] = useState({});
    let placesService = null;
    const navigate = useNavigate();

    const [showReviewPopup, setShowReviewPopup] = useState(false);
    const [isImageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedPlaceForReview, setSelectedPlaceForReview] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [showComments, setShowComments] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);
    const [commentTexts, setCommentTexts] = useState({});
    const [csrfToken, setCsrfToken] = useState(null);

    // Initialize the PlacesService
    useEffect(() => {
        if (!placesService) {
            const map = new window.google.maps.Map(
                document.createElement("div")
            );
            placesService = new window.google.maps.places.PlacesService(map);
        }
        fetchFavorites(currentPage);
    }, [currentPage]);

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

    // Fetch favorites and enrich with place details
    const fetchFavorites = async (page = 1) => {
        try {
            const response = await fetch(`/get-favorites?page=${page}`);
            if (response.ok) {
                const result = await response.json();
                const seenPlaceIds = new Set(); // Set to track seen place IDs
                const placesWithDetails = await Promise.all(
                    result.favorites.data.map(async (favorite) => {
                        if (seenPlaceIds.has(favorite.place_id)) {
                            return null; // Skip duplicate places
                        }
                        seenPlaceIds.add(favorite.place_id);
                        return fetchPlaceDetails(favorite.place_id);
                    })
                );

                // Filter out any null values (duplicates)
                setFavorites(
                    placesWithDetails.filter((place) => place !== null)
                );
                setTotalPages(result.favorites.last_page);

                // Initialize filledIcons based on fetched favorites
                const initialIcons = {};
                result.favorites.data.forEach((place) => {
                    initialIcons[place.place_id] = true; // Set heart to filled
                });
                setFilledIcons(initialIcons);
            } else {
                console.error("Failed to fetch favorites");
            }
        } catch (error) {
            console.error("Error fetching favorites:", error);
        }
    };

    // Fetch detailed place information using Google Places API
    const fetchPlaceDetails = (placeId) => {
        return new Promise((resolve, reject) => {
            const request = {
                placeId,
                fields: ["name", "photos", "vicinity", "opening_hours"],
            };
            placesService.getDetails(request, (place, status) => {
                if (
                    status === window.google.maps.places.PlacesServiceStatus.OK
                ) {
                    resolve({
                        id: placeId,
                        name: place.name || t("Unknown Place"),
                        location: place.vicinity || t("Unknown Location"),
                        hours:
                            place.opening_hours?.weekday_text.join(", ") ||
                            t("No hours available"),
                        photos: place.photos || [],
                    });
                } else {
                    console.error("Error fetching place details:", status);
                    reject(status);
                }
            });
        });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const toggleIcon = async (placeId) => {
        // Check if CSRF token is available
        if (!csrfToken) {
            console.error("CSRF token is missing");
            toast.error("CSRF token is missing. Please refresh the page.");
            return;
        }

        try {
            // Send a request to the backend to remove the favorite
            const response = await fetch("/remove-favorite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken, // Use the CSRF token from state
                },
                body: JSON.stringify({ placeId }),
            });

            if (response.ok) {
                // Remove the card from the favorites array
                setFavorites((prevFavorites) =>
                    prevFavorites.filter((place) => place.id !== placeId)
                );

                // Update the filledIcons state
                setFilledIcons((prevState) => ({
                    ...prevState,
                    [placeId]: false,
                }));

                // Show success toast message
                toast.success("Favorite removed successfully!");
            } else {
                console.error("Failed to remove favorite");
                // Show error toast message
                toast.error("Failed to remove favorite. Please try again.");
            }
        } catch (error) {
            console.error("Error removing favorite:", error);
            // Show error toast message
            toast.error(`An error occurred: ${error.message}`);
        }
    };

    const handleGetDirections = (placeId) => {
        window.location.href = `/userhome?place_id=${placeId}`; // Navigate and reload
    };

    const handleViewReviewClick = async (place) => {
        setSelectedPlaceForReview(place); // Set the selected place
        setShowReviewPopup(true); // Open the popup

        try {
            const response = await fetch(`/reviews/${place.id}`); // Ensure this matches the `id` field
            setReviews(await response.json());
        } catch (error) {
            console.error("Error fetching reviews:", error);
            setReviews([]); // Fallback to an empty array if there's an error
        }
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
            alert("Failed to add comment. Please try again.");
        }
    };

    const handleCommentChange = (reviewId, e) => {
        setCommentTexts((prevState) => ({
            ...prevState,
            [reviewId]: e.target.value,
        }));
    };

    const openImageModal = (imagePath) => {
        setSelectedImage(imagePath);
        setImageModalOpen(true);
    };

    const closeImageModal = () => {
        setImageModalOpen(false);
        setSelectedImage(null);
    };

    const getItemProps = (index) => ({
        className: `pagination-item ${
            currentPage === index ? "filled" : "text"
        }`,
        onClick: () => handlePageChange(index),
    });

    const next = () => {
        if (currentPage === totalPages) return;
        handlePageChange(currentPage + 1);
    };

    const prev = () => {
        if (currentPage === 1) return;
        handlePageChange(currentPage - 1);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Favorites" />
            <div className="favorites-body">
                <div className="favorites-container">
                    <h1 className="favorites-header">{t("favorites")}</h1>

                    {/* Toast notifications */}
                    <ToastContainer />

                    <div className="grid-container">
                        {favorites.length > 0 ? (
                            favorites.map((place) => (
                                <div key={place.id} className="custom-card">
                                    <div className="custom-card-gradient"></div>
                                    <div className="custom-card-content">
                                        {place.photos.length > 0 ? (
                                            <img
                                                src={place.photos[0].getUrl({
                                                    maxWidth: 700,
                                                    maxHeight: 600,
                                                })}
                                                alt={place.name}
                                                className="custom-card-image"
                                            />
                                        ) : (
                                            <div className="image-placeholder"></div>
                                        )}
                                        <h2 className="custom-card-title">
                                            {place.name}
                                        </h2>
                                        <p className="custom-card-description">
                                            {place.location}
                                        </p>
                                        <p className="custom-card-hours">
                                            {place.hours}
                                        </p>

                                        <div className="card-options">
                                            <button
                                                className="option-button"
                                                onClick={() =>
                                                    handleGetDirections(
                                                        place.id
                                                    )
                                                }
                                            >
                                                {t("get_directions")}
                                            </button>
                                            <button
                                                className="option-button"
                                                onClick={() =>
                                                    handleViewReviewClick(place)
                                                }
                                            >
                                                {t("View_Reviews")}
                                            </button>
                                            <button
                                                className="favorite-icon"
                                                onClick={() =>
                                                    toggleIcon(place.id)
                                                }
                                            >
                                                {filledIcons[place.id] ? (
                                                    <FaHeart />
                                                ) : (
                                                    <FaRegHeart />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>{t("No favorites added yet.")}</p>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    <div className="pagination-controls">
                        <button
                            className="pagination-button"
                            onClick={prev}
                            disabled={currentPage === 1}
                        >
                            <ArrowLeftIcon
                                strokeWidth={2}
                                className="pagination-icon"
                            />{" "}
                            {t("previous")}
                        </button>
                        <div className="flex items-center gap-2">
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    {...getItemProps(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            className="pagination-button"
                            onClick={next}
                            disabled={currentPage === totalPages}
                        >
                            {t("next")}
                            <ArrowRightIcon
                                strokeWidth={2}
                                className="pagination-icon"
                            />
                        </button>
                    </div>
                </div>

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
                                                    {"★".repeat(review.rating)}
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
                                                    Comments:
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
                                                        ? "Hide Comments"
                                                        : "Show Comments"}
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
                                                              No comments
                                                              available.
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
                                                    placeholder="Write your comment here..."
                                                />
                                                <button
                                                    className="comment-button"
                                                    onClick={() =>
                                                        handleAddComment(
                                                            review.id
                                                        )
                                                    }
                                                >
                                                    Add Comment
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>
                                        No reviews available for this
                                        establishment.
                                    </p>
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
            </div>
        </AuthenticatedLayout>
    );
}
