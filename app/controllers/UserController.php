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

    /**
     * 用户注册
     *
     */
    public function store()
    {
        return $this->register();
    }

    protected function register()
    {
        $username = Input::get('username');
        $email    = Input::get('email');
        $password = Input::get('password');

        $client = MultiplexController::getWebServiceClient();

        $params = array(
                'UserName'  => $username,
                'UserPass'  => $password,
                'UserEamil' => $email,
            );
        $data = $client->RegistUser($params);

        $result = json_decode($data->RegistUserResult);
        if (intval($result->RstValue) > 0) {
            // 注册成功
            $this->saveThirdPartyUser($username, $password);
            return (array) $result;
        }

        throw new ApiException($result->RstDesc);
    }

    /**
     * 本地存储第三方登录用户信息
     *
     * @param  string $username 登录名
     * @param  string $password 密码
     * @return void
     */
    protected function saveThirdPartyUser($username, $password)
    {
        if (!Input::has('token')) {
            return;
        }

        $token = Input::get('token');

        if (strlen($token) !== 30) {
            return;
        }

        $insertData = array(
                'token'      => $token,
                'username'   => $username,
                'password'   => $password,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            );
        DB::table('third_party_user_token')->insert($insertData);
    }

    /**
     * 用户添加栏目
     *
     */
    public function addColumn()
    {
        $uid = $this->authorizer->getResourceOwnerId();
        // 获取本地初始化栏目
        $default = CommonController::getInitColumn();

        $ids = Input::get('ids', $default);

        // 用户更新栏目
        return (array) $this->putUserColumn($uid, $ids);
    }

    /**
     * 用户注销或退出登录
     *
     */
    public function logout()
    {
        $oauthAccessToken = DB::table('oauth_access_tokens');

        $oauthAccessToken->where('id', $this->accessToken)->delete();

        return Response::make('', 204);
    }

    /**
     * 获取当前用户的信息
     *
     */
    public function show()
    {
        $this->uid = $this->authorizer->getResourceOwnerId();
        // 获取用户信息
        $user = $this->getUser();

        return (array) $user;
    }

    /*
     * 修改用户个人信息
     *
     */
    public function modify()
    {
        $this->uid = $this->authorizer->getResourceOwnerId();
        // 修改远程的用户信息
        $this->updateUser();

        $user = User::find($this->uid);

        $allowedFields = ['avatar_url', 'name', 'gender'];

        array_walk($allowedFields, function($item) use ($user) {
            $v = Input::get($item);
            if ($v && $item !== 'avatar_url') {
                $user->$item = $v;
            }
            if ($item === 'avatar_url' && Input::has('avatar_url')) {
                $user->avatar_url = $this->updateAvatar($this->uid);
            }
        });

        $user->save();

        $this->forgetUserCache();

        $returnData = $this->getUser();
        $returnData->gender = $user->gender;
        $returnData->name = $user->name;
        $returnData->avatar_url = $user->avatar_url;

        return (array) $returnData;
    }

    protected function forgetUserCache()
    {
        Cache::forget('users/'.$this->uid);
    }

    /**
     * 更新用户头像
     *
     * @param  string $uid 用户id
     * @return string
     */
    protected function updateAvatar($uid)
    {
        $imageStr = Input::get('avatar_url');

        $subDir = substr($uid, -1);
        $storgePath = Config::get('imagecache::paths.avatar_url_prefix').'/'.$subDir;
        $path = public_path().$storgePath;
        $path = str_replace('\\', '/', $path);
        if (!is_dir($path)) {
            @mkdir($path, 0777, true);
        }

        $matchFlag = preg_match('/^(data:\s*image\/(\w+);base64,)/', $imageStr, $matches);
        if (!$matchFlag) {
            throw new ApiException;
        }

        $ext = $matches[2];
        $fileName = $path.'/'.$uid.'.'.$ext;
        $flag = file_put_contents($fileName, base64_decode(str_replace($matches[1], '', $imageStr)));
        if ($flag === false) {
            throw new ValidationException('上传头像发生错误');
        }

        return $storgePath.'/'.$uid.'.'.$ext;
    }

    /**
     * 我的评论
     *
     */
    public function myComment()
    {
        $uid = $this->authorizer->getResourceOwnerId();

        $commentModel = DB::table('article_comment')
            ->select('id', 'created_at', 'favours', 'content', 'article_id', 'image_flag', 'user_id', 'user_ip')
            ->where('user_id', $uid)
            ->latest('created_at');
        // 增加文章评论数据分页
        $this->addPagination($commentModel);

        $commentIds = $commentModel->lists('id');

        $comments = array();
        foreach ($commentIds as $id) {
            $comments[] = $this->getCommentById($id);
        }

        foreach ($comments as $comment) {
            $comment->flag = 1;
            $comment->article = $this->getCommentOrigin(
                $comment->article_id, $comment->image_flag
            );
            unset($comment->user_id, $comment->user_ip, $comment->image_flag);
        }

        return $comments;
    }

    /**
     * 我的收藏
     *
     */
    public function myStar()
    {
        $uid = $this->authorizer->getResourceOwnerId();

        $starModel = DB::table('star')
            ->select('id', 'article_id', 'image_flag')
            ->where('user_id', $uid)
            ->latest('created_at');
        // 增加我的收藏数据分页
        $this->addPagination($starModel);
        $stars = $starModel->get();

        foreach ($stars as $value) {
            $value->article = $this->getArticleByFlag($value->article_id, $value->image_flag);

            unset($value->article_id, $value->image_flag);
        }

        return $stars;
    }

    /**
     * 我的消息
     *
     * @return array
     */
    public function myInformation()
    {
        $uid = $this->authorizer->getResourceOwnerId();

        $model = DB::table('information')
            ->select('id', 'from_uid', 'from_user_ip', 'created_at', 'content', 'type')
            ->where('to_uid', $uid)
            ->orderBy('created_at', 'desc');

        // 增加我的消息数据分页
        $this->addPagination($model);

        $information = $model->get();

        return $this->processMyInformation($information);
    }

    /**
     * 处理我的消息返回数据
     *
     * @param  array $returnData
     * @return array
     */
    protected function processMyInformation($returnData)
    {
        foreach ($returnData as $information) {
            $this->uid  = $information->from_uid;
            $this->ip   = $information->from_user_ip;
            $information->user = $this->getOwner();

            if ($information->type === 0) {
                // 消息为系统消息，不做处理
                $information->content_info = ['sys' => $information->content];
            } else {
                // 消息是序列化后的消息，则需要反序列还原原来的消息
                $information->content_info = unserialize($information->content);
            }

            unset($information->from_uid, $information->from_user_ip, $information->content, $information->type);
        }

        return $returnData;
    }

    public function relevance()
    {
        // vaidate token
        $token = Input::get('token');
        $uid = $this->authorizer->getResourceOwnerId();

        $userToken = DB::table('user_token');

        $userToken->where('token', $token)
            ->update(array('user_id' => $uid, 'updated_at' => date('Y-m-d H:i:s')));

        DB::table('oauth')
            ->where('id', $userToken->where('token', $token)->first()->oauth_id)
            ->update(array('user_id' => $uid, 'updated_at' => date('Y-m-d H:i:s')));

        $userToken->where('token', $token)->delete();
    }
}
