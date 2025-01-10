<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        // Check if the email is already verified
        if ($request->user()->hasVerifiedEmail()) {
            // Log the user out
            Auth::logout();
            return redirect()->route('login')->with('status', 'Email already verified. Please log in.');
        }

        // Mark email as verified
        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        // Log the user out after email verification
        Auth::logout();

        // Redirect to login with status message
        return redirect()->route('login')->with('status', 'Email succesfully verified. Please log in.');
    }
}
