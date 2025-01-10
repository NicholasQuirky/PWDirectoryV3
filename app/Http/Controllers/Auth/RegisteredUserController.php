<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rule; // Ensure this is imported
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users')->where(function ($query) {
                    return $query->whereNull('deleted_at'); // Check only for non-soft-deleted users
                }),
            ],
            'username' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users')->where(function ($query) {
                    return $query->whereNull('deleted_at'); // Check only for non-soft-deleted users
                }),
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Check if the user exists but is soft-deleted
        $existingUser = User::onlyTrashed()
            ->where('email', $request->email)
            ->orWhere('username', $request->username)
            ->first();

        if ($existingUser) {
            // Restore the soft-deleted user
            $existingUser->restore();

            // Clear email verification timestamp
            $existingUser->email_verified_at = null; // Clear email verification timestamp

            // Optionally, reset the password
            $existingUser->password = Hash::make($request->password);
            $existingUser->save();

            // Login the user
            Auth::login($existingUser);

            return redirect(route('dashboard'));
        }

        // Create a new user
        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard'));
    }
}
