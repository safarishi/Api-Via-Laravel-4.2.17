<?php

use LucaDegasperi\OAuth2Server\Authorizer;
use Rootant\Api\Exception\DuplicateOperationException;

class CommentController extends CommonController
{
    protected $userId;

    protected $userIp;

    public function __construct(Authorizer $authorizer)
    {
        parent::__construct($authorizer);
        $this->beforeFilter('oauth', ['except' => ['anonymousReply']]);
        $this->beforeFilter('validation');
        $this->afterFilter('@forgetCache', ['only' => ['favour', 'unfavour']]);
    }

    private static $_validate = [
        'favour' => [
            'flag' => 'required|in:1,2,3',
        ],
        'unfavour' => [
            'flag' => 'required|in:1,2,3',
        ],
        'reply' => [
            'content' => 'required',
            'flag'    => 'required|in:1,2,3',
        ],
        'anonymousReply' => [
            'content' => 'required',
            'flag'    => 'required|in:1,2,3',
        ],
    ];

    /**
     * 文章评论点赞
     *
     * @param  string $id         文章id
     * @param  string $comment_id 文章评论id
     */
    public function favour($id, $commentId)
    {
        $this->flag = Input::get('flag');

        $this->userId = $this->authorizer->getResourceOwnerId();

        if ($this->checkUserFavour($this->userId, $commentId)) {
            throw new DuplicateOperationException('您已点赞！');
        }

        $insertData = array(
                'user_id'            => $this->userId,
                'article_comment_id' => $commentId,
                'flag'               => $this->flag,
                'created_at'         => date('Y-m-d H:i:s'),
                'updated_at'         => date('Y-m-d H:i:s'),
            );
        $insertId = $this->models['favour']->insertGetId($insertData);

        // 文章评论被点赞数量 +1
        $this->operator = '+';
        $this->updateCommentFavours($commentId);
        // 存储文章评论点赞相关信息到用户的消息数据表
        $this->content = '赞了这条评论:)';
        $this->storeInfomation($commentId, 1);

        return (array) $this->models['favour']->find($insertId);
    }

    /**
     * 文章评论取消点赞
     *
     * @param  string $id         文章id
     * @param  string $comment_id 文章的评论id
     */
    public function unfavour($id, $commentId)
    {
        $this->flag = Input::get('flag');

        $this->userId = $this->authorizer->getResourceOwnerId();

        $quantity = DB::table('favour')
            ->where('user_id', $this->userId)
            ->where('article_comment_id', $commentId)
            ->where('flag', '=', $this->flag)
            ->delete();

        if ($quantity === 1) {
            // 文章评论被点赞数量 -1
            $this->operator = '-';
            $this->updateCommentFavours($commentId);
            // 存储文章评论点赞相关信息到用户的消息数据表
            $this->content = '取消赞了这条评论:(';
            $this->storeInfomation($commentId, 1);
        }

        return Response::make('', 204);
    }

    public function forgetCache($route)
    {
        $key = 'comments/'.$route->getParameter('comment_id');
        Cache::forget($key);
    }

    /**
     * 文章评论回复
     *
     * @param  string $id        文章id
     * @param  string $commentId 文章的评论id
     */
    public function reply($id, $commentId)
    {
        $this->flag = Input::get('flag');

        $this->userId = $this->authorizer->getResourceOwnerId();
        // 回复公共逻辑
        $insertData = $this->replyIntersection($commentId);
        $insertData = array_merge($insertData, ['user_id' => $this->userId]);

        return $this->replyResponse($insertData, $commentId);
    }

    /**
     * 匿名用户回复文章评论
     *
     * @param  string $id        文章id
     * @param  string $commentId 文章评论id
     */
    public function anonymousReply($id, $commentId)
    {
        // 校验验证码
        MultiplexController::verifyCaptcha();

        $this->flag = Input::get('flag');

        $this->userIp = Request::ip();

        $insertData = self::replyIntersection($commentId);
        $insertData = array_merge($insertData, ['user_ip' => $this->userIp]);

        return $this->replyResponse($insertData, $commentId);
    }

    /**
     * 文章评论的回复响应数据
     *
     * @param  int   $id 文章评论id
     * @return array
     */
    protected function replyResponse($insertData, $commentId)
    {
        $insertId = $this->models['reply']->insertGetId($insertData);
        // forget cache of comment replies
        $key = 'comments/'.$commentId.'/replies';
        Cache::forget($key);

        $this->content = '回复：'.$this->content;
        // 存储文章评论回复相关信息到用户的消息数据表
        $this->storeInfomation($commentId, 2);

        $replyResult = $this->models['reply']
            ->select('id', 'created_at', 'content', 'user_id', 'user_ip')
            ->find($insertId);

        $this->uid = $replyResult->user_id;
        $this->ip  = $replyResult->user_ip;
        $replyResult->user = $this->getOwner();

        return (array) $replyResult;
    }

    /**
     * 回复/匿名回复评论提取公共代码
     *
     * @param  string $commentId  文章评论id
     * @return array
     */
    protected function replyIntersection($commentId)
    {
        $this->content = Input::get('content');

        $this->models['reply'] = DB::table('reply');

        $insertData = array(
                'article_comment_id' => $commentId,
                'content'            => $this->content,
                'flag'               => $this->flag,
                'created_at'         => date('Y-m-d H:i:s'),
                'updated_at'         => date('Y-m-d H:i:s'),
            );

        return $insertData;
    }

    /**
     * 存储相关信息到消息数据表
     *
     * @param  string  $commentId 文章评论id
     * @param  integer $type      消息类型：1-评论点赞/取消点赞，2-评论回复
     * @return void
     */
    protected function storeInfomation($commentId, $type)
    {
        if ($this->flag !== '1') {
            return;
        }

        $content_info = $this->infoIntersection($commentId);

        $insertData = array(
                'type'       => $type,
                'content'    => serialize($content_info), // 存储序列化后的内容
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            );

        if ($this->userId === null) {
            $insertData = array_merge($insertData, ['from_user_ip' => $this->userIp]);
        } else {
            $insertData = array_merge($insertData, ['from_uid' => $this->userId]);
        }

        if ($this->uid === null) {
            $insertData = array_merge($insertData,
                ['to_user_ip' => $this->ip, 'unread_user_ip' => $this->ip]
            );
        } else {
            $insertData = array_merge($insertData,
                ['to_uid' => $this->uid, 'unread_uid' => $this->uid]
            );
        }

        $this->models['information']->insert($insertData);
    }

    /**
     * 存储消息的公共部分
     *
     * @param  string $commentId 文章评论id
     * @return array
     */
    private function infoIntersection($commentId)
    {
        $this->models['information'] = DB::table('information');

        $this->models['article_comment'] = DB::table('article_comment');

        return array_merge(
                ['reply' => $this->content],
                ['comment' => (array) $this->articleComment($commentId)]
            );
    }

    /**
     * 获取文章评论的信息
     *
     * @param  string $id 文章的评论id
     * @return object
     */
    private function articleComment($id)
    {
        $comment = $this->models['article_comment']
            ->select('id', 'user_id', 'user_ip', 'article_id', 'created_at', 'content')
            ->find($id);

        // 获取评论所属用户信息
        $this->uid = $comment->user_id;
        $this->ip  = $comment->user_ip;
        $comment->owner = $this->getOwner();
        unset($comment->user_id, $comment->user_ip, $comment->article_id);

        return $comment;
    }

}