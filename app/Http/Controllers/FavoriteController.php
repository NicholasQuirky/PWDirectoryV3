<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FavoriteController extends Controller
{
    // Add a new favorite
    public function store(Request $request)
    {
        $request->validate([
            'placeId' => 'required|string|max:255',
        ]);
    
        $userId = Auth::id();
    
        // Check if the place_id already exists for the user
        $exists = DB::table('favorites')
            ->where('user_id', $userId)
            ->where('place_id', $request->placeId)
            ->exists();
    
        if ($exists) {
            return response()->json(['message' => 'This place is already in your favorites'], 400);
        }
    
        DB::table('favorites')->insert([
            'user_id' => $userId,
            'place_id' => $request->placeId,
            'created_at' => now(),
        ]);
    
        return response()->json(['message' => 'Place added to favorites'], 200);
    }

    public function destroy(Request $request)
{
    $request->validate([
        'placeId' => 'required|string|max:255',
    ]);

    $userId = Auth::id();

    // Remove the favorite from the database
    $deleted = DB::table('favorites')
        ->where('user_id', $userId)
        ->where('place_id', $request->placeId)
        ->delete();

    if ($deleted) {
        return response()->json(['message' => 'Favorite removed successfully'], 200);
    } else {
        return response()->json(['message' => 'Failed to remove favorite'], 400);
    }
}

    

    // Get user's favorites with pagination
    public function index(Request $request)
    {
        $userId = Auth::id();
        
        // Paginate favorites, 5 per page
        $favorites = DB::table('favorites')
            ->where('user_id', $userId)
            ->paginate(4);

        return response()->json(['favorites' => $favorites]);
    }
}


