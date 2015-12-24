<?php

namespace Rootant\Api\Exception;

use Rootant\Api\Exception\ApiException;

class ResourceNonExistentException extends ApiException
{
    public function __construct($msg)
    {
        parent::__construct($msg, 14007);
        $this->httpStatusCode = 404;
        $this->errorType      = 'invalid_resoure';
    }
}