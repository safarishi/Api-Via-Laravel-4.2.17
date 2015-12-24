<?php

use LucaDegasperi\OAuth2Server\Authorizer;
use Rootant\Api\Exception\ValidationException;

class CommunityController extends CommonController
{
    public function __construct(Authorizer $authorizer)
    {
        parent::__construct($authorizer);
        $this->beforeFilter('oauth', ['except' => ['index', 'getArticleCommentsByTags']]);
        $this->beforeFilter('validation');
    }

    private static $_validate = [
        // todo
    ];

    public function index()
    {
        $type = Input::get('type', 'all');

        if ($type !== 'all' && $type !== 'hot') {
            throw new ValidationException('参数传递错误！');
        }

        $tag = DB::table('tag');

        if ($type === 'all') {
            $tag->orderBy('reorder');
        } else {
            // 双order排序，先按前者排序，当按前者排序相同时再按后者排序
            $tag->orderBy('reorder')->orderBy('counts', 'desc')->take(5);
        }

        return $tag->select('id', 'name')->get();
    }

    /**
     * 根据文章的标签获取评论信息
     *
     * @param  string $tagStr 标签id字符串，类似： 3,5,
     */
    public function getArticleCommentsByTags($tagStr)
    {
        $tagArr = explode(',', $tagStr);

        $tag = DB::table('tag')
            ->whereIn('id', $tagArr)
            ->implode('name', ',');

        $csi_comment = $this->getCommentByTag($tag);

        $sisi_comment = $this->getSisiComment($tag);
        foreach ($sisi_comment as $comment) {
            $comment->owner = $comment->user;
            // unset var
            unset($comment->user);
        }

        $csp_comment = $this->getCspComment($tag);
        foreach ($csp_comment as $comment) {
            $comment->owner = $comment->user;
            // unset var
            unset($comment->user);
        }

        return array_merge($csi_comment, $sisi_comment, $csp_comment);
    }

    /**
     * [getCommentByTag description]
     * @param  string $tag 标签
     * @return todo
     */
    protected function getCommentByTag($tag)
    {
        $idArr = DB::table('article_comment')
            ->where('tag', '=', $tag)
            ->latest('created_at')
            ->take(1)
            ->lists('id');
        $comments = array();
        foreach ($idArr as $id) {
            $comments[] = $this->getCommentById($id);
        }

        foreach ($comments as $comment) {
            $comment->flag = 1;
            $comment->article = $this->getCommentOrigin($comment->article_id, $comment->image_flag);
            $comment->owner   = $comment->user;
            unset($comment->user_id, $comment->user_ip);
        }

        return $comments;
    }

}