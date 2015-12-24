<?php

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use League\OAuth2\Server\Exception\OAuthException;

/*
|--------------------------------------------------------------------------
| Register The Laravel Class Loader
|--------------------------------------------------------------------------
|
| In addition to using Composer, you may use the Laravel class loader to
| load your controllers and models. This is useful for keeping all of
| your classes in the "global" namespace without Composer updating.
|
*/

ClassLoader::addDirectories(array(

	app_path().'/commands',
	app_path().'/controllers',
	app_path().'/models',
	app_path().'/database/seeds',
    app_path().'/libs',

));

/*
|--------------------------------------------------------------------------
| Application Error Logger
|--------------------------------------------------------------------------
|
| Here we will configure the error logger setup for the application which
| is built on top of the wonderful Monolog library. By default we will
| build a basic log file setup which creates a single file for logs.
|
*/

Log::useFiles(storage_path().'/logs/laravel.log');

/*
|--------------------------------------------------------------------------
| Application Error Handler
|--------------------------------------------------------------------------
|
| Here you may handle any errors that occur in your application, including
| logging them or displaying custom views for specific errors. You may
| even register several error handlers to handle different types of
| exceptions. If nothing is returned, the default error view is
| shown, which includes a detailed stack trace during debug.
|
*/

/**
 * 覆盖 OAuth 错误信息
 */
App::error(function(OAuthException $e)
{
    if($e->shouldRedirect()) {
        return new RedirectResponse($e->getRedirectUri());
    } else {
        $attrs = [];
        $errorType = $e->errorType;
        $errorMessage = $e->getMessage();
        if ($errorType == 'invalid_request') {
            if ($errorMessage == 'The refresh token is invalid.') {
                $errorType = 'invalid_refresh_token';
            } else {
                preg_match('/"(.*?)"/', $errorMessage, $matches);
                $parameter = $matches[1];
                $attrs['parameter'] = $parameter;
            }
        }

        $message = Lang::get('oauth.'.$errorType, $attrs);
        $message = starts_with($message, 'oauth.') ? $errorMessage : $message;

        return new JsonResponse([
                'error' => $e->errorType,
                'error_description' => $message
            ],
            $e->httpStatusCode,
            $e->getHttpHeaders()
        );
    }
});

App::error(function(Exception $exception, $code)
{
	Log::error($exception);
});

App::error(function(ModelNotFoundException $e)
{
    return Response::make('Not Found', 404);
});

/*
|--------------------------------------------------------------------------
| Maintenance Mode Handler
|--------------------------------------------------------------------------
|
| The "down" Artisan command gives you the ability to put an application
| into maintenance mode. Here, you will define what is displayed back
| to the user if maintenance mode is in effect for the application.
|
*/

App::down(function()
{
	return Response::make("Be right back!", 503);
});

/*
|--------------------------------------------------------------------------
| Require The Filters File
|--------------------------------------------------------------------------
|
| Next we will load the filters file for the application. This gives us
| a nice separate location to store our route and application filter
| definitions instead of putting them all in the main routes file.
|
*/

require app_path().'/filters.php';