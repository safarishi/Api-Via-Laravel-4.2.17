<?php

namespace Rootant\Api\Exception;

use Rootant\Api\Exception\ApiException;

class ValidationException extends ApiException
{
    public function __construct($msg)
    {
        parent::__construct($msg, 14001);
        $this->httpStatusCode = 400;
        $this->errorType = 'invalid_request';
    }
}