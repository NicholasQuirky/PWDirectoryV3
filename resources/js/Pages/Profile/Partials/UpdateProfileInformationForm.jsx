import { useState } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { useForm, usePage } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = "",
}) {
    const { t } = useTranslation();
    const [isHovered, setIsHovered] = useState(false);
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            username: user.username,
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route("profile.update"));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    {t("profile.header")}
                </h2>
            </header>

            <form onSubmit={submit} className="mt-6">
                {/* Flexbox Container for Side-by-Side Inputs */}
                <div className="flex gap-6">
                    <div className="w-1/2">
                        <InputLabel htmlFor="name" value={t("profile.name")} />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div className="w-1/2">
                        <InputLabel
                            htmlFor="username"
                            value={t("profile.username")}
                        />
                        <TextInput
                            id="username"
                            className="mt-1 block w-full"
                            value={data.username}
                            onChange={(e) => setData("username", e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-2" message={errors.username} />
                    </div>
                </div>

                {/* Submit Button Aligned to the End */}
                <div className="flex justify-end items-center gap-4 mt-6">
                    <PrimaryButton
                        disabled={processing}
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
                        {t("profile.saveButton")}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            {t("profile.savedMessage")}
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
