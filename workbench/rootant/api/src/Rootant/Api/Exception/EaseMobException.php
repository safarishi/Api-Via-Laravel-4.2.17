<?php

namespace Rootant\Api\Exception;

use Rootant\Api\Exception\ApiException;

class EaseMobException extends ApiException
{
    public function __construct($msg)
    {
        parent::__construct($msg, 15001);
        $this->httpStatusCode = 500;
        $this->errorType = 'third_party_error';
    }
}