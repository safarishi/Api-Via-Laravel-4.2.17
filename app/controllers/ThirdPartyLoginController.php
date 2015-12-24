<?php

use Rootant\Api\Exception\InvalidClientStateException;

class ThirdPartyLoginController extends BaseController
{
    const INDEX_URI = 'web/index.html#/index/home';

    const THIRD_PARTY_BIND_URI = 'web/index.html#/index/thirdPartyLogin';

    protected $curlMethod = 'GET';

    /**
     * 公共的 curl 操作
     *
     * @return string
     */
    protected function curlOperate()
    {
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => $this->curlUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $this->curlMethod,
            CURLOPT_SSL_VERIFYPEER => false,
        ));

        $response = curl_exec($curl);
        $err = curl_error($curl);

        curl_close($curl);

        if ($err) {
            echo 'cURL Error #:'.$err;
        } else {
            return $response;
        }
    }

    protected function redirectUrl($type)
    {
        $this->type = $type;

        return $this->gernerateUrl();
    }

    public function generateWeiboUrl()
    {
        $this->type = 'weibo';

        return $this->gernerateUrl();
    }

    public function generateQqUrl()
    {
        $this->type = 'qq';

        return Redirect::to($this->gernerateUrl());
    }

    public function generateWeixinUrl()
    {
        $this->type = 'weixin';

        return $this->gernerateUrl();
    }

    protected function gernerateUrl()
    {
        $config = Config::get('services.'.$this->type);

        switch ($this->type) {
            case 'weibo':
                $url = 'https://api.weibo.com/oauth2/authorize?client_id='.
                    $config['AppId'].'&redirect_uri='.
                    urlencode($config['CallbackUrl']).'&response_type=code&state=weiboTest';
                break;
            case 'qq':
                $url = 'https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id='.
                    $config['AppId'].'&redirect_uri='.
                    urlencode($config['CallbackUrl']).'&state=qqTest';
                break;
            case 'weixin':
                $url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='.
                    $config['AppId'].'&redirect_uri='.
                    urlencode($config['CallbackUrl']).'&response_type=code&scope=snsapi_userinfo&state=weixinTest#wechat_redirect';
                break;
            default:
                # code...
                break;
        }

        return $url;
    }

    protected function redirectToBindUser($queryString)
    {
        return Redirect::to(self::THIRD_PARTY_BIND_URI.$queryString);
    }

    /**
     * 第三方登录回调处理逻辑
     *
     * @param  string   $type [description]
     * @return function       [description]
     */
    public function callback($type)
    {
        $this->type = $type;

        if (Input::get('state') !== $this->type.'Test') {
            throw new InvalidClientStateException('状态值不合法:(');
        }

        $openId = $this->getOpenId();

        $result = $this->hasOpenId($openId);

        if ($result) {
            return Redirect::to($result);
        }
        // 获取第三方用户基本信息 : 昵称 头像地址
        list($nickname, $avatarUrl) = $this->getBasicInformation($openId);

        $tmpToken = MultiplexController::uuid();

        $this->storeOpenId($openId, $tmpToken);

        $queryString = '?name='.$nickname.'&avatar_url='.$avatarUrl.'&token='.$tmpToken;

        return $this->redirectToBindUser($queryString);
    }

    protected function getBasicInformation($openId)
    {
        $user = $this->fetchUser($openId);

        switch ($this->type) {
            case 'weibo':
                $avatarUrl = $user->avatar_hd;
                $nickname  = $user->name;
                break;
            case 'qq':
                $avatarUrl = $user->figureurl_qq_2;
                $nickname  = $user->nickname;
                break;
            case 'weixin':
                $avatarUrl = $user->headimgurl;
                $nickname  = $user->nickname;
                break;
            default:
                // todo
                break;
        }

        return [$nickname, $avatarUrl];
    }

    /**
     * [getOpenId description]
     * @return string
     */
    protected function getOpenId()
    {
        $this->serviceConfig = Config::get('services.'.$this->type);

        $this->code = Input::get('code');

        switch ($this->type) {
            case 'weibo':
                $this->curlUrl = 'https://api.weibo.com/oauth2/access_token?client_id='.
                    $this->serviceConfig['AppId'].'&client_secret='.
                    $this->serviceConfig['AppSecret'].'&grant_type=authorization_code&redirect_uri='.
                    urlencode($this->serviceConfig['CallbackUrl']).'&code='.$this->code;

                $this->curlMethod = 'POST';
                break;
            case 'qq':
                return $this->getQqOpenId();
                break;
            case 'weixin':
                $this->curlUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='
                    .$this->serviceConfig['AppId'].'&secret='
                    .$this->serviceConfig['AppSecret'].'&code='
                    .$this->code.'&grant_type=authorization_code';
                break;
            default:
                # code...
                break;
        }

        $outcome = json_decode($this->curlOperate());
        $this->accessToken = $outcome->access_token;

        return ($this->type === 'weibo') ? $outcome->uid : $outcome->openid;
    }

    /**
     * 获取 qq 第三方登录的 Open ID
     *
     * @return string
     */
    protected function getQqOpenId()
    {
        $this->curlUrl = 'https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id='.
            $this->serviceConfig['AppId'].'&client_secret='.
            $this->serviceConfig['AppSecret'].'&code='.
            Input::get('code').'&redirect_uri='.
            urlencode($this->serviceConfig['CallbackUrl']);

        $outcome = $this->curlOperate();

        parse_str($outcome, $arr);

        $this->accessToken = $arr['access_token'];
        $this->curlUrl = 'https://graph.qq.com/oauth2.0/me?access_token='.$this->accessToken;
        $str = $this->curlOperate();
        $start = strpos($str, '{');
        $length = strpos($str, '}') - $start + 1;
        $jsonStr = substr($str, $start, $length);

        return json_decode($jsonStr)->openid;
    }

    /**
     * [fetchUser description]
     * @param  string $openId Open ID
     * @return object stcClass
     */
    protected function fetchUser($openId)
    {
        switch ($this->type) {
            case 'weibo':
                $this->curlUrl    = 'https://api.weibo.com/2/users/show.json?access_token='.$this->accessToken.'&uid='.$openId;
                $this->curlMethod = 'GET';
                break;
            case 'qq':
                $this->curlUrl = 'https://graph.qq.com/user/get_user_info?access_token='.
                    $this->accessToken.'&openid='.
                    $openId.'&appid='.$this->serviceConfig['AppId'];
                break;
            case 'weixin':
                $this->curlUrl = 'https://api.weixin.qq.com/sns/userinfo?access_token='.
                    $this->accessToken.'&openid='.
                    $openId.'&lang=zh_CN';
                break;
            default:
                # code...
                break;
        }

        return json_decode($this->curlOperate());
    }

    /**
     * [storeOpenId description]
     * @param  string $openId   Open ID
     * @param  string $tmpToken 临时 token
     * @return void
     */
    protected function storeOpenId($openId, $tmpToken)
    {
        $insertId = DB::table('oauth')
            ->insertGetId([
                    'open_id'    => $openId,
                    'type'       => $this->type,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s'),
                ]);

        DB::table('tmp_token')
            ->insert([
                    'token'      => $tmpToken,
                    'oauth_id'   => $insertId,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s'),
                ]);
    }

    /**
     * [hasOpenId description]
     * @param  string  $openId Open ID
     * @return string|false
     */
    protected function hasOpenId($openId)
    {
        $this->removeDirtyData($openId);

        $exist = DB::table('oauth')->where('open_id', $openId)
            ->orderBy('user_id', 'desc')
            ->first();

        if ($exist !== null && $exist->user_id !== 0) {
            $model = DB::table('third_party_user_token')
                ->where('oauth_id', $exist->id)
                ->first();

            $token = $model->token;

            return self::INDEX_URI.'?token='.$token;
        }

        return false;
    }

    /**
     * delete dirty data of table oauth
     *
     * @return void
     */
    private function removeDirtyData($openId)
    {
        DB::table('oauth')->where('open_id', $openId)
            ->where('user_id', 0)
            ->delete();
    }

    /**
     * 根据 token 获取用户登录口令
     *
     * @return array
     */
    public function entry()
    {
        $token = Input::get('token');

        if (strlen($token) !== 30) {
            throw new ValidationException('token 参数传递错误');
        }

        $model = DB::table('third_party_user_token')
            ->where('token', $token)
            ->first();

        if ($model === null) {
            throw new ValidationException('无效的 token');
        }

        return [
            'username' => $model->username,
            'password' => $model->password,
        ];
    }

}