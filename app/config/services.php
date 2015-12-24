<?php

return array(

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Stripe, Mailgun, Mandrill, and others. This file provides a sane
    | default location for this type of information, allowing packages
    | to have a conventional place to find your various credentials.
    |
    */

    'mailgun' => array(
        'domain' => '',
        'secret' => '',
    ),

    'mandrill' => array(
        'secret' => '',
    ),

    'stripe' => array(
        'model'  => 'User',
        'secret' => '',
    ),

    'weibo' => array(
        'AppId'       => '1357609072',
        'AppSecret'   => '114c85a056db5bde50b4740ea1bbda65',
        'CallbackUrl' => 'http://m.chinashippinginfo.net/v1/callbacks/weibo',
    ),

    'qq' => array(
        'AppId'       => '101272765',
        'AppSecret'   => '04d19a0b755fda1a4dc1d6fbfc30ab50',
        'CallbackUrl' => 'http://m.chinashippinginfo.net/v1/callbacks/qq',
    ),

    'weixin' => array(
        'AppId'       => 'wx30fb0b0693502a70',
        'AppSecret'   => 'ddfc88f42a0c7d6f1facb20170c720e1',
        'CallbackUrl' => 'http://m.chinashippinginfo.net/v1/callbacks/weixin',
    ),

);
