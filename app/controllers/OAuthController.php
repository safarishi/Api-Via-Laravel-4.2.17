<?php

use Illuminate\Routing\Controller;
use LucaDegasperi\OAuth2Server\Authorizer;

class OAuthController extends ApiController
{
    protected $authorizer;

    public function __construct(Authorizer $authorizer)
    {
        $this->authorizer = $authorizer;
    }

    public function postAccessToken()
    {
		return $this->authorizer->issueAccessToken();
    }

    /**
     * oauth2 password 校验
     *
     * @param  string $username 登录名
     * @param  string $password 密码
     * @return todo|false
     */
    public static function passwordVerify($username, $password)
    {
        $client = MultiplexController::getWebServiceClient();

        $parameters = array(
                'UserName' => $username,
                'UserPass' => $password,
                'Inner'    => 1,
                'IsEncry'  => 0,
            );
        $data = $client->LoginUser($parameters);
        $result = json_decode($data->LoginUserResult);
        if ($result->RstValue === '0') {
            // 登录成功，关联本地用户
            return self::associateLocalUser($result->UserId);
        }

        return false;
    }

    /**
     * associae remote user to local user
     *
     * @param string $uuid 远程用户 uuid
     */
    protected static function associateLocalUser($uuid)
    {
        $user = DB::table('user');

        $exist = $user->where('uuid', $uuid)->first();
        if ($exist) {
            return $exist->id;
        }

        $avatarUrl = self::getAvatarUrl();

        $insertData = array(
                'uuid'       => $uuid,
                'avatar_url' => $avatarUrl,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            );
        $insertId = $user->insertGetId($insertData);

        // 同步（初始化）用户的栏目信息
        self::synchronousUserColumn($insertId);

        self::processToken($insertId);

        return $insertId;
    }

    protected static function getAvatarUrl()
    {
        $avatarUrl = Config::get('imagecache::paths.avatar_url_prefix').'/default.png';

        if (!Input::has('avatar_url')) {
            return $avatarUrl;
        }

        $avatar = Input::get('avatar_url');

        if (preg_match('#^http(s)?://#', $avatar) === 1) {
            $avatarUrl = $avatar;
        }

        return $avatarUrl;
    }

    /**
     * 用户栏目同步
     *
     * @param  int $userId [description]
     * @return void
     */
    private static function synchronousUserColumn($userId)
    {
        // 获取初始化栏目信息
        $columnIds = CommonController::getInitColumn();

        $userColumn = DB::table('user_column');

        $exist = $userColumn->where('user_id', $userId)->exists();

        if ($exist) {
            return;
        }

        $userColumn->insert([
                'user_id'    => $userId,
                'column_ids' => $columnIds,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
    }

    protected static function processToken($uid)
    {
        if (!Input::has('token')) {
            return;
        }

        $token = Input::get('token');

        if (strlen($token) !== 30) {
            return;
        }

        self::processData($uid, $token);
    }

    protected static function processData($uid, $token)
    {
        $userToken = DB::table('tmp_token');

        $exist = $userToken->where('token', $token)
            ->first();

        if ($exist === null) {
            throw new ValidationException('无效的 token');
        }

        $oauthId = $exist->oauth_id;
        DB::table('oauth')->where('id', $oauthId)
            ->update(array('user_id' => $uid, 'updated_at' => date('Y-m-d H:i:s')));

        // 更新第三方用户信息表
        DB::table('third_party_user_token')->where('token', $token)
            ->update(array('oauth_id' => $oauthId, 'updated_at' => date('Y-m-d H:i:s')));

        $userToken->where('token', $token)->delete();
    }

}
