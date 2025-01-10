import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/UserAuthenticatedLayout";
import { Head } from "@inertiajs/react";
import "css/Bookmarks.css";
import { useTranslation } from "react-i18next";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Bookmarks({ auth }) {
    const { t } = useTranslation();
    const [bookmarks, setBookmarks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [activeBookmarks, setActiveBookmarks] = useState({});
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

    useEffect(() => {
        if (!placesService) {
            const map = new window.google.maps.Map(
                document.createElement("div")
            );
            placesService = new window.google.maps.places.PlacesService(map);
        }
        fetchBookmarks(currentPage);
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

    const fetchBookmarks = async (page = 1) => {
        try {
            const response = await fetch(`/get-bookmarks?page=${page}`);
            if (response.ok) {
                const result = await response.json();
                const placesWithDetails = await Promise.all(
                    result.data.map(async (bookmark) => {
                        return fetchPlaceDetails(bookmark.place_id);
                    })
                );
                setBookmarks(placesWithDetails);
                setCurrentPage(result.current_page);
                setLastPage(result.last_page);

                const initialActiveState = result.data.reduce(
                    (acc, bookmark) => {
                        acc[bookmark.place_id] = true;
                        return acc;
                    },
                    {}
                );
                setActiveBookmarks(initialActiveState);
            } else {
                console.error("Failed to fetch bookmarks");
            }
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
        }
    };

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

    const handleGetDirections = (placeId) => {
        window.location.href = `/userhome?place_id=${placeId}`; // Navigate and reload
    };
    const toggleBookmark = async (placeId) => {
        // Check if CSRF token is available
        if (!csrfToken) {
            console.error("CSRF token is missing");
            toast.error("CSRF token is missing. Please refresh the page.");
            return;
        }

        try {
            // Send request to backend to remove the bookmark
            const response = await fetch("/remove-bookmark", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken, // Use the CSRF token from state
                },
                body: JSON.stringify({ placeId }),
            });

            if (response.ok) {
                // Remove the place from bookmarks state to update the UI
                setBookmarks((prevState) =>
                    prevState.filter((place) => place.id !== placeId)
                );
                setActiveBookmarks((prevState) => {
                    const updatedState = { ...prevState };
                    delete updatedState[placeId]; // Remove place from active bookmarks
                    return updatedState;
                });

                // Show success toast message
                toast.success("Bookmark removed successfully!");
            } else {
                console.error("Failed to remove bookmark");
                // Show error toast message
                toast.error("Failed to remove bookmark. Please try again.");
            }
        } catch (error) {
            console.error("Error removing bookmark:", error);
            // Show error toast message
            toast.error(`An error occurred: ${error.message}`);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= lastPage) {
            setCurrentPage(newPage);
        }
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
            toast.warn("Failed to add comment. Please try again.");
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
        if (currentPage === lastPage) return;
        handlePageChange(currentPage + 1);
    };

    const prev = () => {
        if (currentPage === 1) return;
        handlePageChange(currentPage - 1);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Bookmarks" />
            <div className="bookmarks-body">
                <div className="bookmarks-container">
                    <h1 className="bookmarks-header">{t("bookmarks")}</h1>
                    <div className="grid-container">
                        {bookmarks.length > 0 ? (
                            bookmarks.map((place) => (
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
                                                className="bookmark-icon"
                                                onClick={() =>
                                                    toggleBookmark(place.id)
                                                }
                                            >
                                                {activeBookmarks[place.id] ? (
                                                    <FaBookmark />
                                                ) : (
                                                    <FaRegBookmark />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>{t("No bookmarks added yet.")}</p>
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
                            {[...Array(lastPage)].map((_, index) => (
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
                            disabled={currentPage === lastPage}
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

                {/* Toastify Container */}
                <ToastContainer />
            </div>
        </AuthenticatedLayout>
    );
}
