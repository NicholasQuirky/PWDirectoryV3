<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    // The table associated with the model
    protected $table = 'comments';

    // The attributes that are mass assignable
    protected $fillable = [
        'review_id',  // The ID of the review being commented on
        'user_id',    // The ID of the user making the comment
        'comment',    // The content of the comment
    ];

    /**
     * Get the review that the comment is associated with.
     */
    public function review()
    {
        return $this->belongsTo(Review::class, 'review_id');
    }

    /**
     * Get the user that owns the comment.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
