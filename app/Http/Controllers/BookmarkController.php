<?php

// BookmarkController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BookmarkController extends Controller
{
    // Add a new bookmark, preventing duplicates
    public function store(Request $request)
    {
        $request->validate([
            'placeId' => 'required|string|max:255',
        ]);

        $userId = Auth::id();
        
        // Check if the place is already bookmarked
        $exists = DB::table('bookmarks')
            ->where('user_id', $userId)
            ->where('place_id', $request->placeId)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'This place is already bookmarked'], 409); // 409 Conflict
        }

        DB::table('bookmarks')->insert([
            'user_id' => $userId,
            'place_id' => $request->placeId,
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Place added to bookmarks'], 200);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'placeId' => 'required|string|max:255',
        ]);
    
        $userId = Auth::id();
    
        DB::table('bookmarks')
            ->where('user_id', $userId)
            ->where('place_id', $request->placeId)
            ->delete();
    
        return response()->json(['message' => 'Bookmark removed successfully'], 200);
    }
    

    // Get user's bookmarks
    public function index(Request $request)
    {
        $userId = Auth::id();
        $bookmarks = DB::table('bookmarks')
            ->where('user_id', $userId)
            ->paginate(4);

        return response()->json($bookmarks);
    }
}
