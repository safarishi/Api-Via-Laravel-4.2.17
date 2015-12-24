<?php

use LucaDegasperi\OAuth2Server\Authorizer;

class CommonController extends ApiController
{

    const SISI_URL = 'http://m.sisi-smu.org';

    const CSP_URL = 'http://m.csapchina.com';

    protected $uid;

    protected $ip;

    /**
     * 文章是否为图片新闻标志位
     * 默认为0，不是图片新闻
     *
     * @var integer
     */
    protected $imageFlag = 0;

    protected $flag = 1;

    /**
     * 获取用户 ID
     * 用户未登录返回空字符串 ''
     * 用户登录返回用户 ID
     *
     * @return string
     */
    protected function getUid()
    {
        return (! $this->accessToken) ? '' : ($this->getOwnerId());
    }

    /**
     * 根据 Access Token 获取用户 ID
     *
     * @return string
     */
    protected function getOwnerId()
    {
        $this->authorizer->validateAccessToken();

        return $this->authorizer->getResourceOwnerId();
    }

    protected function getOwner()
    {
        if ($this->uid !== null) {
            return $this->getUser();
        }

        return $this->anonymousUser();
    }

    protected function getUser()
    {
        $key = 'users/'.$this->uid;
        if (Cache::has($key)) {
            return Cache::get($key);
        }

        $user = DB::table('user')
            ->find($this->uid, ['uuid', 'avatar_url', 'name', 'gender']);

        $client = MultiplexController::getWebServiceClient();

        $parameter = array(
                'UserId' => $user->uuid
            );
        // 拉取远程用户信息
        $data = $client->GetUser($parameter);

        $returnData = json_decode($data->GetUserResult);
        $returnData->avatar_url = $user->avatar_url;
        $returnData->name = $user->name;
        $returnData->gender = $user->gender;
        // 缓存用户信息5天
        $minutes = 5*24*60;
        Cache::put($key, $returnData, $minutes);
        return $returnData;
    }

    /**
     * 获取远程的用户名
     *
     * @return string
     */
    protected function getRemoteUsername()
    {
        $uuid = DB::table('user')->where('id', $this->uid)->pluck('uuid');

        $client = MultiplexController::getWebServiceClient();

        $parameter = array('UserId' => $uuid);

        $data = $client->GetUser($parameter);

        $user = json_decode($data->GetUserResult);

        return $user->UserName;
    }

    protected function anonymousUser()
    {
        $area = MultiplexController::getArea($this->ip);

        $user = new stdClass;
        $user->name = '来自'.$area.'的用户';
        $user->avatar_url = Config::get('imagecache::paths.avatar_url_prefix').'/default.png';

        return $user;
    }

    /**
     * 检查用户是否收藏文章
     *
     * @param  string  $uid       用户 id
     * @param  integer $articleId 文章 id
     * @return boolean
     */
    protected function checkUserStar($uid, $articleId)
    {
        $this->models['star'] = DB::table('star');

        return $this->models['star']
            ->where('user_id', $uid)
            ->where('article_id', $articleId)
            ->where('image_flag', $this->imageFlag)
            ->exists();
    }

    /**
     * 检查用户是否点赞文章评论
     *
     * @param  string  $uid       用户 id
     * @param  integer $articleId 文章 id
     * @return boolean
     */
    protected function checkUserFavour($uid, $commentId)
    {
        $this->models['favour'] = DB::table('favour');

        return $this->models['favour']
            ->where('user_id', $uid)
            ->where('article_comment_id', $commentId)
            ->where('flag', '=', $this->flag)
            ->exists();
    }

    /**
     * 封装获取文章列表
     * via web service 接口
     *
     * @return array
     */
    protected function getArticleList()
    {
        $columnId = Input::get('cid', 8);
        $page     = Input::get('page', 1);
        $perPage  = Input::get('per_page', 5);

        $this->symbol = $page;

        $client = MultiplexController::getWebServiceClient();

        $params = array(
                'strOperType' => $columnId,
                'CurrentPageIndex' => $page,
                'PageSize' => $perPage,
            );
        $data = $client->Web_GetArticleList($params);
        if ($data->Web_GetArticleListResult === '"-1"') {
            // -1 未查询到任何信息，则返回空的数组
            return [];
        }

        return json_decode($data->Web_GetArticleListResult);
    }

    /**
     * 获取本地初始化的栏目 id
     *
     * @return string
     */
    public static function getInitColumn()
    {
        $column = DB::table('column');

        $columnIds = $column->where('init_flag', 1)
            ->lists('id');
        $columnIdStr = implode(',', $columnIds);

        return $columnIdStr;
    }

    /**
     * 更新用户栏目，没有则创建
     *
     * @param  string $uid       用户 id
     * @param  string $columnIds 栏目 id，类似：'1,3'
     * @return todo
     */
    protected function putUserColumn($uid, $columnIds)
    {
        $userColumn = DB::table('user_column');

        $exist = $userColumn->where('user_id', $uid)->exists();

        if (!$exist) {
            $insertData = array(
                    'user_id'    => $uid,
                    'column_ids' => $columnIds,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s'),
                );
            // 添加数据操作
            $userColumn->insert($insertData);
        } else {
            $updateData = array(
                    'column_ids' => $columnIds,
                    'updated_at' => date('Y-m-d H:i:s'),
                );
            // 更新数据操作
            $userColumn->update($updateData);
        }

        return $userColumn->first();
    }

    protected function getImageNews($id)
    {
        $key = 'image_news/'.$id;
        if (Cache::has($key)) {
            return Cache::get($key);
        }

        $client = MultiplexController::getWebServiceClient();

        $params = array(
                'NewsId' => $id,
            );
        $data = $client->GetImgNewsInfo($params);

        $imageNews = json_decode($data->GetImgNewsInfoResult);
        // 缓存远程图片新闻7天
        $minutes = 7*24*60;
        Cache::put($key, $imageNews, $minutes);
        return $imageNews;
    }

    protected function getArticle($id)
    {
        $key = 'articles/'.$id;
        if (Cache::has($key)) {
            return Cache::get($key);
        }

        $client = MultiplexController::getWebServiceClient();

        $parameter = array(
                'ArticleId' => $id,
            );
        $data = $client->GetArticleInfo($parameter);

        $article = json_decode($data->GetArticleInfoResult);
        // 缓存远程文章7天
        $minutes = 7*24*60;
        Cache::put($key, $article, $minutes);
        return $article;
    }

    /**
     * 获取评论所属的文章或者图片新闻信息
     * 根据 $flag 标志位去判断
     *
     * @param  integer $id   文章id或者是图片新闻id
     * @param  integer $flag 0 -文章id，1 -图片新闻id
     * @return object
     */
    protected function getCommentOrigin($id, $flag)
    {
        if ($flag === 1) {
            return $this->getImageNewsBrief($id);
        }

        return $this->getArticleBrief($id);
    }

    /**
     * 获取评论所属的文章或者图片新闻信息
     * 根据 $flag 标志位去判断
     *
     * @param  integer $id   文章id或者是图片新闻id
     * @param  integer $flag 0 -文章id，1 -图片新闻id
     * @return object
     */
    protected function getArticleByFlag($id, $flag)
    {
        if ($flag === 1) {
            return $this->getImageNewsBrief($id);
        }

        return $this->getArticleBrief($id);
    }

    protected function getArticleBrief($id)
    {
        $article = $this->getArticle($id);

        unset($article->KeyWord, $article->CategoryName, $article->PicName,
            $article->CommentCount, $article->TotalPages, $article->NewDataRows,
            $article->Body, $article->ShareLink);

        return $article;
    }

    protected function getImageNewsBrief($id)
    {
        $imageNews = $this->getImageNews($id);

        unset($imageNews->KeyWord, $imageNews->CategoryName, $imageNews->PicName,
            $imageNews->CommentCount, $imageNews->TotalPages, $imageNews->NewDataRows,
            $imageNews->Body, $imageNews->ShareLink);

        return $imageNews;
    }

    /**
     * 判断文章是否是图片新闻
     *
     * @return void
     */
    protected function isImageNews()
    {
        $this->type = Input::get('type', '8');

        if ($this->type === '8') {
            $this->imageFlag = 1;
        }
    }

    /**
     * [getReples description]
     * @param  [type] $commentId [description]
     * @return [type]     [description]
     */
    protected function getReplies($commentId)
    {
        $key = 'comments/'.$commentId.'/replies';
        if (Cache::has($key)) {
            return Cache::get($key);
        }

        $replies = DB::table('reply')
            ->where('article_comment_id', $commentId)
            ->where('flag', '=', '1')
            ->latest('created_at')
            ->take(2)
            ->get();

        foreach ($replies as $reply) {
            $this->uid = $reply->user_id;
            $this->ip  = $reply->user_ip;

            $reply->user = $this->getOwner();

            unset($reply->user_id, $reply->user_ip, $reply->article_comment_id, $reply->updated_at);
        }

        // 缓存评论的回复1小时
        $minutes = 60;
        Cache::put($key, $replies, $minutes);

        return $replies;
    }

    /**
     * 增加数据模型分页
     *
     * @param  object $model 需要分页的数据模型
     * @return void
     */
    protected function addPagination($model)
    {
        // 第几页数据，默认第一页
        $page    = Input::get('page', 1);
        // 每页显示数据条目，默认每页20条数据
        $perPage = Input::get('per_page', 20);
        $page    = intval($page);
        $perPage = intval($perPage);

        if ($page <= 0 || !is_int($page)) {
            $page = 1;
        }
        if (!is_int($perPage) || $perPage < 1 || $perPage > 100) {
            $perPage = 20;
        }
        // skip -- offset , take -- limit
        $model->skip(($page - 1) * $perPage)->take($perPage);
    }

    protected function updateUser()
    {
        if (!Input::has('email') && !Input::has('company') && !Input::has('position')) {
            return;
        }

        $user = $this->getUser();

        $input = Input::only('email', 'company', 'position');

        $inputEmail    = $input['email'];
        $inputCompany  = $input['company'];
        $inputPosition = $input['position'];

        $client = MultiplexController::getWebServiceClient();

        $parameter = array(
                'UserName' => $user->UserName,
                'EMail'    => ($inputEmail === null)    ? ($user->UserEmail) : $inputEmail,
                'Company'  => ($inputCompany === null)  ? ($user->Company)   : $inputCompany,
                'Position' => ($inputPosition === null) ? ($user->Post)      : $inputPosition,
            );
        $client->UpdUser($parameter);
    }

    protected function searchArticle()
    {
        $perPage = Input::get('per_page', 20);
        $perPage = floor($perPage / 2);
        if ($perPage <= 0) {
            $perPage = 1;
        }

        $client = MultiplexController::getWebServiceClient();

        $params = array(
                'Title' => Input::get('title', ''),
                'KeyWords' => Input::get('q', ''),
                'CurrentPageIndex' => Input::get('page', 1),
                'PageSize' => $perPage,
            );
        $data = $client->Web_GetArticleQuery($params);

        if ($data->Web_GetArticleQueryResult === '"-1"') {
            // -1 未查询到任何信息，则返回空的数组
            return [];
        }

        return json_decode($data->Web_GetArticleQueryResult);
    }

    protected function searchRelatedArticle($tag)
    {
        $client = MultiplexController::getWebServiceClient();

        $parameter = [
            'KeyWords' => $tag,
            'CurrentPageIndex' => 1,
            'PageSize' => 2,
        ];

        $articles = $client->Web_GetArticleQuery($parameter);

        if ($articles->Web_GetArticleQueryResult === '"-1"') {
            // -1 未查询到任何信息，则返回空的数组
            return [];
        }

        return json_decode($articles->Web_GetArticleQueryResult);
    }

    /**
     * 根据评论id获取评论内容
     *
     * @param  int  $id 评论id
     * @return todo
     */
    protected function getCommentById($id)
    {
        $key = 'comments/'.$id;
        if (Cache::has($key)) {
            $comment = Cache::get($key);
        } else {
            $comment = DB::table('article_comment')
                ->find($id);
            $minutes = 21;
            Cache::put($key, $comment, $minutes);
        }
        $comment->is_favoured = $this->isFavoured($comment->favours, $id);

        $this->uid = $comment->user_id;
        $this->ip  = $comment->user_ip;
        $comment->user = $this->getOwner();

        $comment->replies = $this->getReplies($id);

        return $comment;
    }

    protected function isFavoured($quantity, $id)
    {
        if ($quantity == 0) {
            return false;
        }

        if (!$this->accessToken) {
            return false;
        }

        $uid = $this->getOwnerId();

        return $this->checkUserFavour($uid, $id);
    }

    protected function getAllTagName()
    {
        $key = 'tag_names';
        if (Cache::has($key)) {
            return Cache::get($key);
        }

        $tagArr = DB::table('tag')->lists('name');
        $minutes = 24*60;
        Cache::put($key, $tagArr, $minutes);

        return $tagArr;
    }

    /**
     * todo
     * @param  [type] $str article title or content
     * @return string
     */
    protected function getTagStr($str)
    {
        $tagArr = $this->getAllTagName();

        $tag = array();
        foreach ($tagArr as $value) {
            preg_match('#'.$value.'#', $str, $matches);
            if ($matches) {
                $tag[] = $matches[0];
            }
        }

        return implode(',', $tag);
    }

    protected function getTagForComment()
    {
        $tagArr = $this->getTagFromComment();

        ksort($tagArr);

        return last($tagArr) ?: '';
    }

    protected function getTagForArticle($articleId)
    {
        $this->articleId = $articleId;

        $tagArr = $this->getTagFromComment();

        $returnArr = array_filter($tagArr, function($value)
        {
            return ! strpos($value, ',');
        });

        return last($returnArr) ?: '';
    }

    protected function getTagFromComment()
    {
        $tagArr = DB::table('article_comment')
            ->where('article_id', '=', $this->articleId)
            ->where('tag', '<>', '')
            ->latest('created_at')
            ->take(8)
            ->lists('tag');

        return array_flip(array_count_values($tagArr));
    }

    /**
     * get the comment from sisi
     *
     * @param  string $tag 标签
     * @return todo
     */
    protected function getSisiComment($tag)
    {
        $this->placeholder = ['second', 'article_comment', '2', self::SISI_URL];

        return $this->getPlaceholderComment($tag);
    }

    /**
     * get the comment from the csp
     *
     * @param  string $tag 标签
     * @return todo
     */
    protected function getCspComment($tag)
    {
        $this->placeholder = ['fourth', 'journal_comment', '3', self::CSP_URL];

        return $this->getPlaceholderComment($tag);
    }

    protected function getPlaceholderComment($tag)
    {
        list($connection, $table, $webFlag) = $this->placeholder;

        $comments = DB::connection($connection)
            ->table($table)
            ->where('tag', '=', $tag)
            ->latest('created_at')
            ->take(1)
            ->get();
        foreach ($comments as $comment) {
            list($functionName, $propertyName) = ($webFlag === '2')
                ? ['getSisiArticleById', 'article_id']
                : ['getCspArticleById', 'journal_id'];

            $comment->flag        = $webFlag;
            $comment->is_favoured = $this->checkIsFavoured($comment->favours, $comment->id, $webFlag);
            $comment->article     = $this->{$functionName}($comment->{$propertyName});
            $comment->replies     = $this->getPlaceholderCommentReply($comment->id);
            $comment->user        = $this->getUserByFlag($comment->user_id, $comment->user_ip);
            // release some var
            unset($comment->user_id, $comment->user_ip, $comment->updated_at, $comment->{$propertyName});
        }

        return $comments;
    }

    protected function getPlaceholderCommentReply($commentId)
    {
        list($connection, $table, $flag, $urlPrefix) = $this->placeholder;

        $replies = DB::connection($connection)
            ->table('reply')
            ->where($table.'_id', '=', $commentId)
            ->where('flag', '=', $flag)
            ->latest('created_at')
            ->take(1)
            ->get();
        foreach ($replies as $reply) {
            $reply->user = $this->getUserByFlag($reply->user_id, $reply->user_ip);
            // release some var
            unset($reply->user_id, $reply->user_ip, $reply->updated_at);
        }

        $currentReply = $this->getCurrentReply($commentId);

        return array_merge($currentReply, $replies);
    }

    private function getCurrentReply($commentId)
    {
        list(, , $flag) = $this->placeholder;

        $replies = DB::table('reply')
            ->where('article_comment_id', '=', $commentId)
            ->where('flag', '=', $flag)
            ->latest('created_at')
            ->take(1)
            ->get();
        foreach ($replies as $reply) {
            $this->uid   = $reply->user_id;
            $this->ip    = $reply->user_ip;
            $reply->user = $this->getOwner();
        }

        return $replies;
    }

    protected function getUserByFlag($uid, $ip)
    {
        list(, , $flag, $urlPrefix) = $this->placeholder;

        $functionName = ($flag === '2')
            ? 'getSisiUser' : 'getCspUser';

        $user = $this->{$functionName}($uid, $ip);
        if (! starts_with($user->avatar_url, 'http')) {
            $user->avatar_url = $urlPrefix.$user->avatar_url;
        }

        return $user;
    }

    protected function getPlaceholderUser($uid, $ip)
    {
        if ($uid === null) {
            return (object) [
                'name'       => MultiplexController::getArea($ip),
                'avatar_url' => Config::get('imagecache::paths.avatar_url_prefix').'/default.png',
            ];
        }

        return DB::connection($this->connection)
            ->table('user')
            ->find($uid, $this->fields);
    }

    protected function getSisiUser($uid, $ip)
    {
        $this->connection = 'second';
        $this->fields     = ['display_name as name', 'avatar_url'];

        return $this->getPlaceholderUser($uid, $ip);
    }

    protected function getCspUser($uid, $ip)
    {
        $this->connection = 'fifth';
        $this->fields = ['name', 'avatar_url'];

        return $this->getPlaceholderUser($uid, $ip);
    }

    protected function getSisiArticleById($articleId)
    {
        return DB::connection('third')
            ->table('articles')
            ->where('article_id', '=', $articleId)
            ->first(['article_id as Id ', 'article_writer as Source']);
    }

    protected function getCspArticleById($journalId)
    {
        return DB::connection('fifth')
            ->table('qikan')
            ->find($journalId, ['id as Id', 'qname as Source']);
    }

    protected function checkIsFavoured($favours, $commentId, $flag)
    {
        if ($favours == 0) {
            return  false;
        }

        if (! $this->accessToken) {
            return false;
        }

        $uid = $this->getOwnerId();

        $this->flag = $flag;

        return $this->checkUserFavour($uid, $commentId);
    }

    /**
     * 更新评论被点赞次数
     *
     * @param  string $commentId 评论id
     * @return void
     */
    protected function updateCommentFavours($commentId)
    {
        list($this->connection, $this->table) = $this->getConnection();

        $delta = ($this->operator === '+') ? 1 : -1;

        if ($delta === -1) {
            // check the delta is valid
            // if it is neccssary to decrement
            // if the current favours of comment is zero
            // it is not nessary to decrement
            $delta = $this->isValid($commentId);
        }
        // 如果更新的变化量为 0
        // 直接退出，不做处理
        if ($delta === 0) {
            return;
        }

        DB::connection($this->connection)
            ->table($this->table)
            ->where('id', '=', $commentId)
            // increment 也可以来减少
            ->increment('favours', $delta, array('updated_at' => date('Y-m-d H:i:s')));
    }

    protected function getConnection()
    {
        switch ($this->flag) {
            case '1':
                $connection = 'mysql';
                $table = 'article_comment';
                break;
            case '2':
                $connection = 'second';
                $table = 'article_comment';
                break;
            case '3':
                $connection = 'fourth';
                $table = 'journal_comment';
                break;
        }

        return [$connection, $table];
    }

    protected function isValid($commentId)
    {
        $favours = DB::connection($this->connection)
            ->table($this->table)
            ->where('id', '=', $commentId)
            ->pluck('favours');

        if ($favours > 0) {
            return -1;
        }

        return 0;
    }

}