<?php

namespace Rootant\Api\Exception\OAuth;

use Illuminate\Support\Facades\Lang;
use Rootant\Api\Exception\ApiException;

class UnauthorizedClientException extends ApiException
{
    public function __construct()
    {
        parent::__construct(Lang::get('oauth.unauthorized_client'), 14002);
        $this->httpStatusCode = 401;
        $errorType = class_basename($this);
        $this->errorType = snake_case(strtr($errorType, array('Exception'=>'')));
    }
}