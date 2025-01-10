import AuthenticatedLayout from "@/Layouts/UserAuthenticatedLayout";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import ProfilePhotoForm from "./Partials/ProfilePhotoForm";
import { Head } from "@inertiajs/react";
import "css/Edit.css";
import { useTranslation } from "react-i18next";
import { Link } from "@inertiajs/react";

export default function Edit({ auth, mustVerifyEmail, status }) {
    const { t } = useTranslation();

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t("profileTitle")} />
            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 text-endLeft">
                        {t("myProfile")}
                    </h2>
                    <p className="text-gray-600 text-endLeft mb-8">
                        Update your profile information
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Section (Mobile First) */}
                        <div className="order-1 lg:order-1">
                            {/* Profile Photo Section */}
                            <ProfilePhotoForm user={auth.user} />

                            {/* Profile Information Section */}
                            <div className="p-6 mt-8 border rounded-lg shadow-sm bg-gray-50 mb-6">
                                <UpdateProfileInformationForm />
                            </div>

                            {/* Update Password Section */}
                            <div className="p-6 mt-8 border rounded-lg shadow-sm bg-gray-50 mb-6">
                                <UpdatePasswordForm />
                            </div>

                            {/* Delete Account Section */}
                            <div className="p-6 mt-8 border rounded-lg shadow-sm bg-red-50">
                                <DeleteUserForm />
                            </div>
                        </div>

                        {/* Right Section (For larger screens) */}
                        <div className="order-2 lg:order-2">
                            {/* Accessible Icon */}
                            <div className="flex justify-center mt-6">
                                <img
                                    src="/images/image.png"
                                    alt="Accessible Icon"
                                    className="w-25 h-25"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8">
                        <div className="flex justify-center gap-4">
                            <p className="text-sm text-gray-500">
                                <Link href={route("terms")} className="underline">
                                    Terms and Conditions
                                </Link>
                            </p>
                            <p className="text-sm text-gray-500">
                                <Link href={route("data-privacy")} className="underline">
                                    Data Privacy
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
