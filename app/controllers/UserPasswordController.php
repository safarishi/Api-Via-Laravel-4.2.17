<?php

use LucaDegasperi\OAuth2Server\Authorizer;
use League\OAuth2\Server\Exception\InvalidCredentialsException;

class UserPasswordController extends CommonController
{
    public function __construct(Authorizer $authorizer)
    {
        parent::__construct($authorizer);
        $this->beforeFilter('oauth', ['except' => ['sendEmail', 'reset']]);
        $this->beforeFilter('validation');
    }

    private static $_validate = [
        'modify' => [
            'old_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
        ],
    ];

    public function modify()
    {
        $this->uid = $this->authorizer->getResourceOwnerId();

        $oldPassword = Input::get('old_password');
        $newPassword = Input::get('new_password');

        $this->validateCurrentPassword($oldPassword);

        $updateData = array(
                'password'   => Hash::make($newPassword),
                'updated_at' => date('Y-m-d H:i:s'),
            );

        // how to modify the user password
        // todo
    }

    /**
     * 校验当前用户的密码
     *
     * @param  string $password
     * @return void
     *
     * @throws League\OAuth2\Server\Exception\InvalidCredentialsException
     */
    protected function validateCurrentPassword($password)
    {
        $username = $this->getRemoteUsername();

        $outcome = OAuthController::passwordVerify($username, $password);

        if (!$outcome) {
            throw new InvalidCredentialsException;
        }
    }

}
