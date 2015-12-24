<?php

use Rootant\Api\Exception\ValidationException;

class MultiplexController extends BaseController
{

    protected static $commentId;

    /**
     * soap web service util static method
     *
     * @return object SoapClient
     */
    public static function getWebServiceClient()
    {
        // web service 服务地址
        $wsdl = 'http://manage.chinashippinginfo.net/csiInterface/InteShipping.asmx?wsdl';

        $options = array('trace' => true, 'exceptions' => true);

        return new SoapClient($wsdl, $options);
    }

    /**
     * 第三方登陆用户的 token
     * 处理同步 oauth 表数据
     *
     * @param  string $uid 用户id
     */
    protected static function handleToken($uid)
    {
        $token = Input::get('token');

        if (strlen($token) !== 30) {
            throw new ValidationException('token 参数传递错误');
        }

        $userToken = DB::table('tmp_token');

        $userToken->where('token', $token)
                ->update(array('user_id' => $uid, 'updated_at' => date('Y-m-d H:i:s')));

        $oauthId = $userToken->where('token', $token)->first()->oauth_id;

        DB::table('oauth')
            ->where('id', $oauthId)
            ->update(array('user_id' => $uid, 'updated_at' => date('Y-m-d H:i:s')));

        // 更新第三方用户信息表
        DB::table('third_party_user_token')
            ->where('token', $token)
            ->update(array('oauth_id' => $oauthId, 'updated_at' => date('Y-m-d H:i:s')));

        $userToken->where('token', $token)->delete();
    }

    // modify remote user profile
    public static function modifyRemoteUser($uid)
    {
        $user = self::getUser($uid);

        $input = Input::only('email', 'company', 'position');

        $inputEmail    = $input['email'];
        $inputCompany  = $input['company'];
        $inputPosition = $input['position'];

        $soapClient = self::webServiceUtil();

        $params = array(
                'UserName' => $user->UserName,
                'EMail'    => ($inputEmail === null)    ? ($user->UserEmail) : $inputEmail,
                'Company'  => ($inputCompany === null)  ? ($user->Company)   : $inputCompany,
                'Position' => ($inputPosition === null) ? ($user->Post)      : $inputPosition,
            );

        $soapClient->UpdUser($params);
    }

    /**
     * 根据ip获取用户所在的城市信息
     *
     * @param  string $ip
     * @return string     城市名称
     */
    public static function getArea($ip)
    {
        // 根据ip地址查询地点信息的url
        $url = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json&ip='.$ip;

        $data = json_decode(file_get_contents($url));

        $result = '火星';
        if (is_object($data) && property_exists($data, 'city')) {
            $result = $data->city;
        }

        return $result;
    }

    public function generateCaptcha()
    {
        $token = Input::get('token');

        if (strlen($token) !== 30) {
            throw new ValidationException('token 参数传递错误');
        }

        Captcha::create();

        $captcha = Session::get('captchaHash');

        $captchaToken = DB::table('tmp_token');
        $captchaToken->insert([
                'captcha'    => $captcha,
                'token'      => $token,
                'created_at' => date('Y-m-d H:i:s'),
            ]);
    }

    /**
     * 随机生成默认长度6位由字母、数字组成的字符串
     *
     * @param  integer $length
     * @return string          随机生成的字符串
     */
    public static function generateRandomStr($length = 6)
    {
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $str   = '';
        for ($i = 0; $i < $length; $i++) {
            $str .= $chars[mt_rand(0, strlen($chars) - 1)];
        }
        return $str;
    }

    /**
     * 校验验证码
     *
     * @return void
     */
    public static function verifyCaptcha()
    {
        $token   = Input::get('token');
        $captcha = Input::get('captcha');

        $rules =  array('captcha' => array('required'), 'token' => array('required'));

        $validator = Validator::make(Input::only('captcha', 'token'), $rules);
        if ($validator->fails()) {
            $messages = $validator->messages();
            throw new ValidationException($messages->all());
        }

        $captchaToken = DB::table('tmp_token');
        $data = $captchaToken->where('token', $token)->first();

        if ($data === null) {
            throw new ValidationException('无效的 token');
        }

        $captchaToken->where('token', $token)->delete();

        if (!Hash::check(mb_strtolower($captcha), $data->captcha)) {
            throw new ValidationException('验证码填写不正确');
        }
    }

    /**
     * 生成30位唯一的字符串，作为临时的 token 使用
     *
     * @return string
     */
    public function generateToken()
    {
        echo self::uuid();
    }

    public static function uuid()
    {
        $randomStr = self::generateRandomStr(7);

        return uniqid($randomStr, true);
    }

}