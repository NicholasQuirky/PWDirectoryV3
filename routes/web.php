<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\User;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\FavoriteController; // Import FavoriteController
use App\Http\Controllers\BookmarkController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;


// Public Routes
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});
Route::get('/terms-and-conditions', function () {
    return Inertia::render('Auth/TermsAndConditions'); // Inertia component for Terms and Conditions
})->name('terms');

// Route for Data Privacy
Route::get('/data-privacy', function () {
    return Inertia::render('Auth/DataPrivacy'); // Inertia component for Data Privacy
})->name('data-privacy');

Route::get('/dashboard', function () {
    if (Auth::user()->usertype === 'admin') {
        return redirect()->route('admin.dashboard');
    }
    return redirect()->route('userhome');
})->middleware(['auth', 'verified'])->name('dashboard');


// Email Verification Routes
Route::middleware(['auth'])->group(function () {
    Route::post('/email/verification-notification', function () {
        request()->user()->sendEmailVerificationNotification();
        return back()->with('status', 'verification-link-sent');
    })->name('verification.send');
});

// Authenticated User Routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/csrf-token', function () {
        return response()->json(['csrfToken' => csrf_token()]);
    });

    // Profile Photo Upload Routes
    Route::post('/profile/photo', [ProfileController::class, 'uploadPhoto'])->name('profile.photo.update');
    Route::delete('/profile/photo', [ProfileController::class, 'deletePhoto'])->name('profile.photo.delete');

    // Feedback Routes
    Route::post('/submit-review', [ReviewController::class, 'store']);
    Route::get('/reviews/{placeId}', [ReviewController::class, 'getReviewsByPlaceId']);


    // Favorite Routes
    Route::post('/add-favorite', [FavoriteController::class, 'store']); // Route for adding a favorite
    Route::get('/get-favorites', [FavoriteController::class, 'index']); // Route for getting favorites
    Route::post('/remove-favorite', [FavoriteController::class, 'destroy']); // Route for removing a favorite

    Route::post('/add-bookmark', [BookmarkController::class, 'store']);
    // Get bookmarks
    Route::get('/get-bookmarks', [BookmarkController::class, 'index']);
    Route::post('/remove-bookmark', [BookmarkController::class, 'destroy']); // Add this route

    // Notification Routes 
    Route::get('/notifications', [ReviewController::class, 'getAdminNotifications']);
    Route::get('/notifications/user', [ReviewController::class, 'getUserNotifications']);
    Route::delete('/notifications/{id}', [ReviewController::class, 'deleteNotification']);
    Route::delete('/notifications/clear-all', [ReviewController::class, 'clearAllNotifications']);


        // Mark all notifications as read
    Route::post('/notifications/mark-as-read', [ReviewController::class, 'markNotificationsAsRead']);
    
    //Comment Routes 
    Route::post('/reviews/{review}/comments', [ReviewController::class, 'addComment']);
    Route::get('/reviews/{review}/comments', [ReviewController::class, 'getComments']);



});

// Admin Routes
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('admin/dashboard', [HomeController::class, 'index'])->name('admin.dashboard');

    Route::get('/admin/manage-users', function () {
        return Inertia::render('Admin/ManageUserAccount');
    })->name('admin.manageusers');

    Route::get('/admin/review-feedback', [ReviewController::class, 'index'])->name('admin.reviewFeedback');

    Route::get('/admin/settings', function () {
        return Inertia::render('Admin/AdminSettings');
    })->name('admin.settings');

    Route::get('/users', function () {
        $users = User::where('usertype', '!=', 'admin')->paginate(5); // 10 users per page
        return response()->json($users);
    });
    
    Route::delete('/users/{id}', function ($id) {
        $user = User::findOrFail($id);
        $user->delete(); // Perform a soft delete
        return response()->json(['message' => 'User soft deleted successfully']);
    });

    //Approve or Reject Feedback
    Route::post('/reviews/{id}/approve', [ReviewController::class, 'approve']);
    Route::post('/reviews/{id}/reject', [ReviewController::class, 'reject']);

});

// Verified User Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/bookmarks', function () {
        return Inertia::render('Bookmarks'); // Match the component's name in resources/js/Pages
    })->name('bookmarks');

    Route::get('/favorites', function () {
        return Inertia::render('Favorites'); // Match the component's name in resources/js/Pages
    })->name('favorites');

    Route::get('/userhome', [HomeController::class, 'userHome'])->name('userhome');
});

Route::get('/admin/active-users-count', function () {
    $user = auth()->user(); // Inteliphense will show error but it's fine
    if (!$user) {
        return response()->json(['count' => 0, 'error' => 'No authenticated user'], 401);
    }

    $count = DB::table('users')
        ->where('usertype', '!=', 'admin')
        ->where('id', '!=', $user->id) // Use property access explicitly
        ->whereNotNull('email_verified_at')
        ->count();

    return response()->json(['count' => $count]);
})->middleware(['auth', 'admin']);


Route::get('/terms-and-conditions', function () {
    return Inertia::render('Auth/TermsAndConditions'); // Inertia component for Terms and Conditions
})->name('terms');
Route::get('/data-privacy', function () {
    return Inertia::render('Auth/DataPrivacy'); // Inertia component for Data Privacy
})->name('data-privacy');


// Authentication Routes
require __DIR__.'/auth.php';
