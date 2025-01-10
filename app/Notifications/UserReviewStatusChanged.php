<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Review;

class UserReviewStatusChanged extends Notification
{
    public $review;
    public $status;
    public $reason;

    // Constructor to accept review, status, and reason (for rejection)
    public function __construct(Review $review, $status, $reason = null)
    {
        $this->review = $review;
        $this->status = $status;
        $this->reason = $reason;
    }

    // Define the delivery method (mail)
    public function toMail($notifiable)
    {
        $message = "Your feedback for " . $this->review->place_name . " has been " . $this->status . "!";
    
        // If the review was rejected, add the reason
        if ($this->status === 'rejected' && $this->reason) {
            $message = "Your feedback has been rejected. Reason: " . $this->reason;
        }
    
        return (new MailMessage)
            ->line($message);
    }
    
    // Define the notification for the database (for storing in the database table)
    public function toDatabase($notifiable)
    {
        return [
            'message' => $this->status === 'approved' 
                ? "Your feedback for " . $this->review->place_name . " has been approved!"
                : "Your feedback has been rejected. Reason: " . $this->reason,
            'review_id' => $this->review->id,
        ];
    }

    // Define which channels to use for the notification (mail, database, etc.)
    public function via($notifiable)
    {
        return ['mail', 'database']; // You can add more channels like 'broadcast' if needed
    }
}