<?php

use LucaDegasperi\OAuth2Server\Authorizer;

class UserController extends CommonController
{
    public function __construct(Authorizer $authorizer)
    {
        parent::__construct($authorizer);
        // $this->beforeFilter('oauth', ['except' => 'tmp']);
        // $this->beforeFilter('oauth.checkClient', ['only' => 'store']);
        // $this->beforeFilter('validation');
    }

    private static $_validate = [
        // todo
    ];

    // todo
}
