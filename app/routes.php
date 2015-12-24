<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

Route::get('/', function()
{
    exit('backend');
    // return View::make('hello');
});

Route::patterns([
    'id'         => '[1-9][0-9]*',
    'comment_id' => '[1-9][0-9]*',
    'type'       => 'weibo|qq|weixin',
]);

Route::group(array('prefix' => 'v1'), function()
{
    // todo
});
