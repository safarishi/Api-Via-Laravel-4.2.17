<?php

namespace Rootant\Api\Exception;

use Rootant\Api\Exception\ApiException;

class EmailNotMatchException extends ApiException
{
    public function __construct($msg)
    {
        parent::__construct($msg, 14003);
        $this->httpStatusCode = 400;
        $this->errorType = 'invalid_client';
    }
}