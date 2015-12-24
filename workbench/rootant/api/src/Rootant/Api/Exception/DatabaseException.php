<?php

namespace Rootant\Api\Exception;

use Rootant\Api\Exception\ApiException;

class DatabaseException extends ApiException
{
    public function __construct($msg = 'An database error occured')
    {
        parent::__construct($msg, 91001);
        $this->httpStatusCode = 500;
        $this->errorType = 'server_error';
    }
}