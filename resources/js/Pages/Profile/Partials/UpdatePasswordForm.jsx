import { useState, useRef } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { useForm } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";

export default function UpdatePasswordForm({ className = "" }) {
    const { t } = useTranslation();
    const [isHovered, setIsHovered] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [confirmError, setConfirmError] = useState("");

    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const validatePassword = (password) => {
        const errors = [];
        if (password.length < 8)
            errors.push(t("passwordForm.passwordError.minLength"));
        if (!/[A-Z]/.test(password))
            errors.push(t("passwordForm.passwordError.uppercase"));
        if (!/[0-9]/.test(password))
            errors.push(t("passwordForm.passwordError.number"));
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
            errors.push(t("passwordForm.passwordError.specialChar"));
        setPasswordError(errors.join(" "));
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setData("password", value);
        validatePassword(value);
        checkPasswordsMatch(value, data.password_confirmation);
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setData("password_confirmation", value);
        checkPasswordsMatch(data.password, value);
    };

    const checkPasswordsMatch = (password, confirmPassword) => {
        if (password && confirmPassword && password !== confirmPassword) {
            setConfirmError(t("passwordForm.passwordMismatch"));
        } else {
            setConfirmError("");
        }
    };

    const updatePassword = (e) => {
        e.preventDefault();

        put(route("password.update"), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset("password", "password_confirmation");
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset("current_password");
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    {t("passwordForm.header")}
                </h2>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                {/* Current Password */}
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value={t("passwordForm.currentPassword")}
                    />
                    <div className="relative">
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData("current_password", e.target.value)
                            }
                            type={showCurrentPassword ? "text" : "password"}
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                            {showCurrentPassword
                                ? t("passwordForm.hide")
                                : t("passwordForm.show")}
                        </button>
                    </div>
                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                {/* New Password */}
                <div>
                    <InputLabel
                        htmlFor="password"
                        value={t("passwordForm.newPassword")}
                    />
                    <div className="relative">
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={handlePasswordChange}
                            type={showPassword ? "text" : "password"}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                            {showPassword
                                ? t("passwordForm.hide")
                                : t("passwordForm.show")}
                        </button>
                    </div>
                    {passwordError && (
                        <p className="text-sm text-red-500 mt-1">
                            {passwordError}
                        </p>
                    )}
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Confirm Password */}
                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value={t("passwordForm.confirmPassword")}
                    />
                    <div className="relative">
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={handleConfirmPasswordChange}
                            type={showConfirmPassword ? "text" : "password"}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                            {showConfirmPassword
                                ? t("passwordForm.hide")
                                : t("passwordForm.show")}
                        </button>
                    </div>
                    {confirmError && (
                        <p className="text-sm text-red-500 mt-1">
                            {confirmError}
                        </p>
                    )}
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex justify-end items-center gap-4">
                    <PrimaryButton
                        disabled={
                            processing || !!passwordError || !!confirmError
                        }
                        style={{
                            backgroundColor: isHovered ? "#0056b3" : "#0038A7",
                            color: "#FFFFFF",
                            borderRadius: "4px",
                            padding: "10px 20px",
                            border: "none",
                            transition: "background-color 0.3s ease",
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {t("passwordForm.saveButton")}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            {t("passwordForm.savedMessage")}
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
