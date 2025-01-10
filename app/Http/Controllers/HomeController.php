<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/AdminDashboard'); // Existing method
    }

    public function userHome()
    {
        return Inertia::render('UserHome'); // Adjust path to match your file structure
    }
}

