<?php 

namespace Rootant\Api;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Config;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\QueryException;

use Rootant\Api\Exception\ApiException;
use Rootant\Api\Exception\DatabaseException;


class ApiServiceProvider extends ServiceProvider {

	/**
	 * Indicates if loading of the provider is deferred.
	 *
	 * @var bool
	 */
	protected $defer = false;

	/**
	 * Bootstrap the application events.
	 *
	 * @return void
	 */
	public function boot()
	{
		$this->package('rootant/api');
		$this->bootFilters();
	}

	/**
	 * Register the service provider.
	 *
	 * @return void
	 */
	public function register()
	{
		$this->registerExceptionHandlers();
	}

	/**
	 * Get the services provided by the provider.
	 *
	 * @return array
	 */
	public function provides()
	{
		return array();
	}

	/**
	 * register exception handlers
	 * @return mixed
	 */
	private function registerExceptionHandlers()
	{
		$this->app->error(function(ApiException $e) {
			return $this->handleException($e);
		});
		if (!Config::get('app.debug')) {
			$this->app->error(function(QueryException $e) {
				return $this->handleException(new DatabaseException);
			});
		}
	}

	private function handleException($e) {
		$res = [
			'error' => $e->errorType,
			'error_description' => $e->getMessage()
		];
		if ($code = $e->getCode()) {
			$res['error_code'] = $code;
		}
		if ($uri = $e->errorUri) {
			$res['error_uri'] = $uri;
		}
		return new JsonResponse($res, $e->httpStatusCode, $e->getHttpHeaders());
	}

	/**
	 * Boot the filters
	 * @return void
	 */
	private function bootFilters()
	{
		$this->app['router']->filter('validation', 'Rootant\Api\Filters\ValidationFilter');
	}

}
