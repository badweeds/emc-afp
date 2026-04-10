<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsArticle extends Model
{
    use HasFactory;

    // THE FIX: Added image_path, scope, and reporter so Laravel allows saving them!
    protected $fillable = [
        'title',
        'summary',
        'media_outfit',
        'reporter',
        'topic',
        'unit_involved',
        'category',
        'url',
        'date',
        'scope',
        'image_path'
    ];
}