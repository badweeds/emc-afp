<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsArticle extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'summary',
        'media_outfit',
        'topic',
        'unit_involved',
        'category',
        'url',
        'date',
    ];
}