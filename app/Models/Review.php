<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
    use HasFactory, SoftDeletes;

    // Define the table name (optional if it's 'reviews')
    protected $table = 'reviews';

    // Specify the primary key (optional if it's 'id')
    protected $primaryKey = 'id';

    // Indicate the columns that can be mass assigned
    protected $fillable = [
        'placeid',
        'rating',
        'feedback',
        'imagepath',
        'user_id',
    ];

    // Enable timestamps if your table has 'created_at' and 'updated_at'
    public $timestamps = true;

    // Define the date columns (for automatic casting)
    protected $dates = ['created_at', 'updated_at'];

    /**
     * Scope for filtering reviews by place ID.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $placeId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByPlaceId($query, $placeId)
    {
        return $query->where('placeid', $placeId);
    }

    /**
     * Accessor for image URL.
     *
     * @return string|null
     */

    public function user()
     {
         return $this->belongsTo(User::class, 'user_id');
     }
     
     public function getImageUrlAttribute()
     {
         return $this->imagepath ? asset('storage/reviews/' . basename($this->imagepath)) : null;
     }

     public function comments()
    {
    return $this->hasMany(Comment::class); // A review has many comments
    }

}
