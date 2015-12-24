<?php

return array(

    /*
    |--------------------------------------------------------------------------
    | Name of route
    |--------------------------------------------------------------------------
    |
    | Enter the routes name to enable dynamic imagecache manipulation.
    | This handle will define the first part of the URI:
    |
    | {route}/{template}/{filename}
    |
    | Examples: "images", "img/cache"
    |
    */

    'route' => 'imagecache',

    /*
    |--------------------------------------------------------------------------
    | Storage paths
    |--------------------------------------------------------------------------
    |
    | The following paths will be searched for the image filename, submited
    | by URI.
    |
    | Define as many directories as you like.
    |
    */

    'paths' => array(
        'avatar_url' => public_path().'/uploads/images/avatar',
        'avatar_url_prefix' => '/uploads/images/avatar',
    ),

    /*
    |--------------------------------------------------------------------------
    | Manipulation templates
    |--------------------------------------------------------------------------
    |
    | Here you may specify your own manipulation callbacks.
    | The keys of this array will define which templates
    | are available in the URI:
    |
    | {route}/{template}/{filename}
    |
    */

    'templates' => array(

        'small' => function($image) {
            return $image->fit(120, 90);
        },
        'medium' => function($image) {
            return $image->fit(240, 180);
        },
        'large' => function($image) {
            return $image->fit(480, 360);
        },

        'avatar' => function($image) {
            return $image->fit(138, 138)->encode('png');
        }
    ),

    /*
    |--------------------------------------------------------------------------
    | Image Cache Lifetime
    |--------------------------------------------------------------------------
    |
    | Lifetime in minutes of the images handled by the imagecache route.
    |
    */

    'lifetime' => 43200,

);
