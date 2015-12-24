<?php

namespace Rootant\Api\Exception;

class DuplicateOperationException extends ApiException
{
    public function __construct($msg) {
        parent::__construct($msg, 14009);
        $this->httpStatusCode = 400;
        $this->errorType      = 'invalid_operation';
    }
}