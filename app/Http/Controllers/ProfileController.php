<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
    
        // Fill the user's profile data with validated input
        $user->fill($request->validated());
    
        // You no longer need to check or update the email field
        $user->save();
    
        return Redirect::route('profile.edit');
    }
    
    
    

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);
    
        $user = $request->user();
    
        Auth::logout();
    
        // Perform a soft delete
        $user->delete(); 
    
        // Invalidate session and regenerate token
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    
        return Redirect::to('/');
    }
    
    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'profile_photo' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $user = $request->user();

        // Delete old photo if it exists
        if ($user->profile_photo) {
            // Delete from public directory
            $oldPath = str_replace('public/', '', $user->profile_photo);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        // Store the new photo in the public disk
        $path = $request->file('profile_photo')->store('profile-photos', 'public');
        
        // Move the new photo to the public directory
        $request->file('profile_photo')->move(public_path('profile-photos'), basename($path));

        // Update the user's profile
        $user->profile_photo = $path;
        $user->save();

        return response()->json(['message' => 'Profile photo uploaded successfully!']);
    }

    public function deletePhoto(Request $request)
    {
        $user = $request->user();

        if ($user->profile_photo) {
            // Delete the old photo from both public and storage
            Storage::disk('public')->delete($user->profile_photo);
            // Remove the photo from the user's profile
            $user->profile_photo = null;
            $user->save();

            return response()->json(['message' => 'Profile photo deleted successfully!']);
        }

        return response()->json(['message' => 'No photo to delete.'], 404);
    }
}
