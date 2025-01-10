import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function ProfilePhotoForm({ user }) {
    const { t } = useTranslation();
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(
        user.profile_photo
            ? `/profile-photos/${user.profile_photo.split("/").pop()}`
            : "/default-profile.png"
    );
    const [error, setError] = useState(null);

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const VALID_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!VALID_FILE_TYPES.includes(file.type)) {
            setError(t("profilePhoto.errorFileType"));
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError(t("profilePhoto.errorFileSize"));
            return;
        }

        setError(null);
        setPhoto(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!photo) {
            setError(t("profilePhoto.errorNoPhoto"));
            return;
        }

        const formData = new FormData();
        formData.append("profile_photo", photo);

        try {
            await axios.post("/profile/photo", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert(t("profilePhoto.uploadSuccess"));
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert(t("profilePhoto.uploadFailure"));
        }
    };

    const handleDeletePhoto = async () => {
        try {
            await axios.delete("/profile/photo");
            alert(t("profilePhoto.deleteSuccess"));
            setPreview("/default-profile.png");
            setPhoto(null);
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert(t("profilePhoto.deleteFailure"));
        }
    };

    return (
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
            <div className="flex flex-col items-center">
                {/* Upload/Preview Section */}
                <label className="relative cursor-pointer">
                    <input
                        type="file"
                        className="hidden"
                        onChange={handlePhotoChange}
                        accept="image/*"
                    />
                    {preview ? (
                        <img
                            src={preview}
                            alt="Profile Preview"
                            className="w-32 h-32 rounded-full border-2 border-blue-500"
                        />
                    ) : (
                        <div className="w-32 h-32 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-gray-200 text-center">Upload</span> {/* Ensuring the text is centered */}
                        </div>
                    )}
                </label>

                {/* Buttons */}
                <form onSubmit={handleSubmit} className="mt-4 flex gap-4">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                        {t("profilePhoto.uploadButton") || "Upload Photo"}
                    </button>
                    <button
                        type="button"
                        onClick={handleDeletePhoto}
                        className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition"
                    >
                        {t("profilePhoto.deleteButton") || "Delete Photo"}
                    </button>
                </form>

                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </div>
        </div>
    );
}
