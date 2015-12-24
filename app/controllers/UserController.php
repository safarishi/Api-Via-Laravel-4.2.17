<?php

use LucaDegasperi\OAuth2Server\Authorizer;
use Rootant\Api\Exception\ValidationException;
use Rootant\Api\Exception\DuplicateOperationException;

class UserController extends CommonController
{
    public function __construct(Authorizer $authorizer)
    {
        parent::__construct($authorizer);
        $this->beforeFilter('oauth', ['except' => 'store']);
        $this->beforeFilter('oauth.checkClient', ['only' => 'store']);
        $this->beforeFilter('validation');
    }

    private static $_validate = [
        'store' => [
            'username' => 'required',
            'email'    => 'required|email',
            'password' => 'required|min:6|confirmed',
        ],
        'modify' => [
            'email'  => 'email',
            'gender' => 'in:男,女',
        ],
    ];

}
