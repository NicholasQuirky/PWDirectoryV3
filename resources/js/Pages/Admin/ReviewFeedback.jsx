import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AdminAuthenticatedLayout";
import { Head } from "@inertiajs/react";
import "css/ReviewFeedback.css";
import axios from "axios";

export default function ReviewFeedback({ reviews }) {
    const [processing, setProcessing] = useState(false);
    const [updatedReviews, setUpdatedReviews] = useState(reviews.data || []);
    const [modalData, setModalData] = useState({
        visible: false,
        id: null,
        action: null,
        reason: "", // Store rejection reason
    });
    const [imageModalVisible, setImageModalVisible] = useState(false); // State for image modal visibility
    const [selectedImage, setSelectedImage] = useState(""); // State for selected image URL
    const [errorMessage, setErrorMessage] = useState(""); // Track error message

    useEffect(() => {
        // Reset error message when modal data changes
        setErrorMessage("");
    }, [modalData]);

    // Apply background blur when modal is visible
    useEffect(() => {
        if (modalData.visible) {
            document.body.style.overflow = "hidden"; // Prevent body scroll when modal is open
            document
                .getElementById("main-content")
                .classList.add("blurred-background");
        } else {
            document.body.style.overflow = "auto"; // Allow body scroll when modal is closed
            document
                .getElementById("main-content")
                .classList.remove("blurred-background");
        }
        return () => {
            document.body.style.overflow = "auto"; // Clean up in case component is unmounted
            document
                .getElementById("main-content")
                .classList.remove("blurred-background");
        };
    }, [modalData.visible]);

    const updateReviewStatus = (id, newStatus, reason = "") => {
        setProcessing(true);
        axios
            .post(`/reviews/${id}/${newStatus}`, { reason }) // Send rejection reason with the request
            .then(() => {
                // Update the local state instead of reloading the page
                setUpdatedReviews((prevReviews) =>
                    prevReviews.map((review) =>
                        review.id === id
                            ? { ...review, status: newStatus }
                            : review
                    )
                );
            })
            .catch((error) => {
                console.error(
                    `Error ${
                        newStatus === "approve" ? "approving" : "rejecting"
                    } review:`,
                    error
                );
            })
            .finally(() => {
                setProcessing(false);
                closeModal();
            });
    };

    const openModal = (id, action) => {
        setModalData({ visible: true, id, action, reason: "" }); // Reset reason when opening the modal
    };

    const closeModal = () => {
        setModalData({ visible: false, id: null, action: null, reason: "" });
    };

    const handleModalConfirm = () => {
        if (modalData.action === "reject" && !modalData.reason.trim()) {
            setErrorMessage("Rejection reason is required."); // Display validation error
            return; // Prevent submission if reason is empty
        }

        setErrorMessage(""); // Clear error message if validation passes

        if (modalData.id && modalData.action) {
            updateReviewStatus(
                modalData.id,
                modalData.action,
                modalData.reason
            );
        }
    };

    const handleReasonChange = (e) => {
        setModalData({ ...modalData, reason: e.target.value });
    };

    // Open the image modal
    const openImageModal = (imagePath) => {
        setSelectedImage(imagePath);
        setImageModalVisible(true);
    };

    // Close the image modal
    const closeImageModal = () => {
        setImageModalVisible(false);
        setSelectedImage(""); // Reset the selected image
    };

    return (
        <AuthenticatedLayout>
            <Head title="Review Feedback" />

            <div className="container my-4" id="main-content">
                <h1 className="text-center mb-4">Review Feedback</h1>

                <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Place Name</th>
                                <th>Rating</th>
                                <th>Feedback</th>
                                <th>Posted by</th>
                                <th>Image</th>
                                <th>Status</th>
                                <th>Date Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {updatedReviews.length > 0 ? (
                                updatedReviews.map((review) => (
                                    <tr
                                        key={review.id}
                                        className="d-none d-md-table-row"
                                    >
                                        <td>{review.id}</td>
                                        <td>
                                            {review.place_name ||
                                                "Unknown Place"}
                                        </td>
                                        <td>{review.rating}</td>
                                        <td class="feedback-column">
                                            {review.feedback}
                                        </td>
                                        <td>
                                            {review.user
                                                ? review.user.username
                                                : "Unknown"}
                                        </td>
                                        <td>
                                            <div className="review-image">
                                                {review.imagepath ? (
                                                    <img
                                                        src={`/reviews/${review.imagepath
                                                            .split("/")
                                                            .pop()}`}
                                                        alt="Review Image"
                                                        className="img-thumbnail"
                                                        style={{
                                                            width: "60px",
                                                            height: "60px",
                                                        }}
                                                        onClick={() =>
                                                            openImageModal(
                                                                `/reviews/${review.imagepath
                                                                    .split("/")
                                                                    .pop()}`
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <span>No Image</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    review.status === "approved"
                                                        ? "bg-success"
                                                        : review.status ===
                                                          "rejected"
                                                        ? "bg-danger"
                                                        : "bg-secondary"
                                                }`}
                                            >
                                                {review.status}
                                            </span>
                                        </td>
                                        <td>
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
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-success btn-sm me-2"
                                                onClick={() =>
                                                    openModal(
                                                        review.id,
                                                        "approve"
                                                    )
                                                }
                                                disabled={
                                                    processing ||
                                                    review.status === "approved"
                                                }
                                            >
                                                <i className="bi bi-check-circle"></i>{" "}
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-warning btn-sm"
                                                onClick={() =>
                                                    openModal(
                                                        review.id,
                                                        "reject"
                                                    )
                                                }
                                                disabled={
                                                    processing ||
                                                    review.status === "rejected"
                                                }
                                            >
                                                <i className="bi bi-x-circle"></i>{" "}
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center">
                                        No reviews available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Responsive card layout for smaller screens */}
                    {updatedReviews.length > 0 ? (
                        <div className="d-md-none">
                            {updatedReviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="card mb-3"
                                    style={{
                                        boxShadow:
                                            "0px 2px 5px rgba(0, 0, 0, 0.1)",
                                    }}
                                >
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            {review.place_name ||
                                                "Unknown Place"}
                                        </h5>
                                        <p className="card-text">
                                            <strong>Rating:</strong>{" "}
                                            {review.rating} <br />
                                            <strong>Feedback:</strong>{" "}
                                            {review.feedback} <br />
                                            <strong>Posted by:</strong>{" "}
                                            {review.user
                                                ? review.user.username
                                                : "Unknown"}
                                            <br />
                                            <strong>Status:</strong>{" "}
                                            <span
                                                className={`badge ${
                                                    review.status === "approved"
                                                        ? "bg-success"
                                                        : review.status ===
                                                          "rejected"
                                                        ? "bg-danger"
                                                        : "bg-secondary"
                                                }`}
                                            >
                                                {review.status}
                                            </span>
                                            <br />
                                            <strong>
                                                Date Submitted:
                                            </strong>{" "}
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
                                        {review.imagepath && (
                                            <img
                                                src={`/reviews/${review.imagepath
                                                    .split("/")
                                                    .pop()}`}
                                                alt="Review"
                                                className="img-thumbnail mb-2"
                                                style={{ width: "100%" }}
                                                onClick={() =>
                                                    openImageModal(
                                                        `/reviews/${review.imagepath
                                                            .split("/")
                                                            .pop()}`
                                                    )
                                                }
                                            />
                                        )}
                                        <div className="d-flex justify-content-between">
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() =>
                                                    openModal(
                                                        review.id,
                                                        "approve"
                                                    )
                                                }
                                                disabled={
                                                    processing ||
                                                    review.status === "approved"
                                                }
                                            >
                                                <i className="bi bi-check-circle"></i>{" "}
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-warning btn-sm"
                                                onClick={() =>
                                                    openModal(
                                                        review.id,
                                                        "reject"
                                                    )
                                                }
                                                disabled={
                                                    processing ||
                                                    review.status === "rejected"
                                                }
                                            >
                                                <i className="bi bi-x-circle"></i>{" "}
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center">No reviews available.</p>
                    )}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                    <button
                        className="btn btn-secondary"
                        onClick={() =>
                            (window.location.href = reviews.prev_page_url)
                        }
                        disabled={!reviews.prev_page_url}
                    >
                        Previous
                    </button>
                    <div className="pagination-container">
                        {Array.from(
                            { length: reviews.last_page },
                            (_, index) => index + 1
                        ).map((pageNumber) => (
                            <button
                                key={pageNumber}
                                className={`pagination-btn ${
                                    reviews.current_page === pageNumber
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    (window.location.href = `${reviews.path}?page=${pageNumber}`)
                                }
                            >
                                {pageNumber}
                            </button>
                        ))}
                    </div>
                    <button
                        className="btn btn-secondary"
                        onClick={() =>
                            (window.location.href = reviews.next_page_url)
                        }
                        disabled={!reviews.next_page_url}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Image Modal */}
            {imageModalVisible && (
                <div className="modal-overlay">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Review Image</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeImageModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <img
                                    src={selectedImage}
                                    alt="Selected Review Image"
                                    className="img-fluid"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for approve/reject */}
            {modalData.visible && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {modalData.action === "approve"
                                        ? "Approve Review"
                                        : "Reject Review"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Are you sure you want to{" "}
                                    {modalData.action === "approve"
                                        ? "approve"
                                        : "reject"}{" "}
                                    this review?
                                </p>
                                {modalData.action === "reject" && (
                                    <div>
                                        <textarea
                                            id="rejectionReason"
                                            className={`form-control ${
                                                errorMessage ? "is-invalid" : ""
                                            }`} // Highlight if there's an error
                                            value={modalData.reason}
                                            onChange={handleReasonChange}
                                            placeholder="Please provide a reason for rejection"
                                            rows="4"
                                        ></textarea>
                                        {errorMessage && (
                                            <div className="invalid-feedback">
                                                {errorMessage}
                                            </div>
                                        )}{" "}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleModalConfirm}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <span
                                            className="spinner-border spinner-border-sm"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>
                                    ) : (
                                        "Confirm"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
