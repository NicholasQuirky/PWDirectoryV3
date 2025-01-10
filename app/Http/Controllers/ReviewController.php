<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Review;
use App\Models\Notification; 
use App\Models\Comment; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; 
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Notifications\UserReviewStatusChanged;


class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'placeid' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'required|string|min:20|max:500',
            'image' => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
        ]);
    
        $imagePath = null;
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('reviews'), $filename); 
            $imagePath = 'reviews/' . $filename; 
        }
    
        $reviewId = DB::table('reviews')->insertGetId([ 
            'placeid' => $request->placeid,
            'rating' => $request->rating,
            'feedback' => $request->feedback,
            'imagepath' => $imagePath,
            'user_id' => Auth::id(), 
            'created_at' => now(),
        ]);
    
        $user = Auth::user();
        $userName = $user->name;
    
        $apiKey = env('GOOGLE_PLACES_API_KEY');
        $response = Http::get("https://maps.googleapis.com/maps/api/place/details/json", [
            'place_id' => $request->placeid,
            'key' => $apiKey,
            'fields' => 'name',
        ]);
    
        $placeName = $response->successful() && isset($response['result']['name']) ? $response['result']['name'] : 'Unknown Place';
    
        // Create the notification for the admin about the new review

        Notification::create([
            'reviewedbyadmin' => 6, 
            'submittedby' => Auth::id(), 
            'type' => 'review_submission',
            'message' => "New review waiting approval ID: $reviewId",
            'review_id' => $reviewId,
        ]);
        
        return response()->json(['message' => 'Review submitted successfully! Awaiting admin review.'], 200);
    }
    
    public function index()
    {
        $reviews = Review::with('user')
            ->orderBy('created_at', 'desc') // Ensure reviews are ordered by newest first
            ->paginate(8); // Paginate the results
    
        // Google Places API key
        $apiKey = env('GOOGLE_PLACES_API_KEY');
    
        foreach ($reviews as $review) {
            if ($review->placeid) {
                // Fetch place details from Google Places API
                $response = Http::get("https://maps.googleapis.com/maps/api/place/details/json", [
                    'place_id' => $review->placeid,
                    'key' => $apiKey,
                    'fields' => 'name',
                ]);
    
                if ($response->successful() && isset($response['result']['name'])) {
                    $review->place_name = $response['result']['name'];
                } else {
                    $review->place_name = 'Unknown Place';
                }
            } else {
                $review->place_name = 'Unknown Place';
            }
        }
    
        return Inertia::render('Admin/ReviewFeedback', [
            'reviews' => $reviews,
        ]);
    }
    
    public function approve($id)
    {
        $review = Review::findOrFail($id);
        $review->status = 'approved';
        $review->save();

        $notification = Notification::where('reviewedbyadmin', 6)
            ->where('submittedby', $review->user_id)
            ->where('review_id', $review->id)
            ->where('type', 'review_submission')
            ->first();

        if ($notification) {
            $notification->admin_message = "Review ID: {$review->id} has been approved.";
            $notification->save();
        }

        $user = $review->user;
        $user->notify(new UserReviewStatusChanged($review, 'approved'));

        return response()->json([
            'admin_message' => $notification ? $notification->admin_message : 'No admin message available.'
        ]);
    }
    
    public function reject($id, Request $request)
    {
        // Validate that reason is required and is a string
        $request->validate(['reason' => 'required|string']);
    
        // Find the review by ID
        $review = Review::findOrFail($id);

        $review->status = 'rejected';
        $review->save();
    
        // Get the reason from the request (it will not be stored in the database)
        $reason = $request->input('reason');
    
        // Update notifications
        $notification = Notification::where('reviewedbyadmin', 6)
            ->where('submittedby', $review->user_id)
            ->where('review_id', $review->id)
            ->where('type', 'review_submission')
            ->first();
    
        if ($notification) {
            $notification->admin_message = "Review ID: {$review->id} has been rejected. Reason: $reason";
            $notification->save();
        }
    
        // Notify the user about the rejection
        $user = $review->user;
        $user->notify(new UserReviewStatusChanged($review, 'rejected', $reason));
    
        // Return a response
        return response()->json([
            'admin_message' => $notification ? $notification->admin_message : 'No admin message available.'
        ]);
    }
    
    public function getUserNotifications()
    {
        $userId = Auth::id();
    
        $notifications = Notification::where('submittedby', $userId)
            ->whereNotNull('admin_message')
            ->whereNull('deleted_at')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'admin_message', 'created_at', 'is_read']);
    
        return response()->json($notifications);
    }
    
    public function getAdminNotifications()
    {
        $userId = 6; 
    
        $notifications = Notification::where('reviewedbyadmin', $userId)
            ->orderBy('created_at', 'desc') 
            ->get();
           
        return response()->json($notifications);
    }

    public function markNotificationsAsRead()
    {
        $userId = Auth::id();
    
        // Mark notifications as read for the authenticated user
        Notification::where('submittedby', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Notifications marked as read']);
    }

    public function getReviewsByPlaceId($placeId)
    {
        // Fetch reviews with 'approved' status and include the user who submitted the review
        $reviews = Review::with('user') // This will automatically fetch the user details
            ->where('placeid', $placeId)
            ->where('status', 'approved')
            ->orderBy('created_at', 'desc')
            ->get();
    
        return response()->json($reviews);
    }
    
    public function addComment(Request $request)
{
    // Validate the incoming data
    $request->validate([
        'review_id' => 'required|exists:reviews,id',
        'comment' => 'required|string|min:5|max:500',
    ]);


    $comment = Comment::create([
        'review_id' => $request->review_id,
        'user_id' => Auth::id(), // Get the authenticated user's ID
        'comment' => $request->comment,
    ]);

    return response()->json([
        'message' => 'Comment added successfully!',
        'comment' => $comment,
    ], 201);
}

public function getComments($review_id)
{
    try {
        // Fetch the review and its associated comments, including the user who posted each comment
        $review = Review::with('comments.user') // eager load comments and associated user data
            ->where('id', $review_id)
            ->firstOrFail(); // If the review doesn't exist, it will throw a 404 error

        // Return the comments associated with this review
        return response()->json([
            'comments' => $review->comments, // Return the comments of the review
        ]);
    } catch (\Exception $e) {
        // Log the error for debugging
        Log::error('Error fetching comments for review', [  
            'review_id' => $review_id,
            'error_message' => $e->getMessage()
        ]);
        
        // Return an error response
        return response()->json([
            'message' => 'Error fetching comments',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function deleteNotification($id)
{
    try {
        $notification = Notification::findOrFail($id);
        $notification->delete(); // Soft delete
        return response()->json(['message' => 'Notification deleted successfully'], 200);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to delete notification'], 500);
    }
}
}
