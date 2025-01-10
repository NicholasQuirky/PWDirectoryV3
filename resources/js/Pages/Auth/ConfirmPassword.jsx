import GuestLayout from "@/Layouts/GuestLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, useForm } from "@inertiajs/react";
import LanguageToggler from "./LanguageToggler";
import { useTranslation } from "react-i18next";

export default function ConfirmPassword() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        password: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.confirm"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            {/* Language Toggler */}
            <div style={{ position: "absolute", top: "20px", right: "20px" }}>
                <LanguageToggler />
            </div>
            <Head title={t("confirmPassword.title")} />

            <div className="mb-4 text-sm text-gray-600">
                {t("confirmPassword.secure_area_message")}
            </div>

            <form onSubmit={submit}>
                <div className="mt-4">
                    <InputLabel
                        htmlFor="password"
                        value={t("confirmPassword.password")}
                    />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={(e) => setData("password", e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-end mt-4">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        {t("confirmPassword.confirm_button")}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
