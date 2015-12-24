<?php

use Rootant\Api\Exception\ApiException;
use LucaDegasperi\OAuth2Server\Authorizer;
use Rootant\Api\Exception\DuplicateOperationException;
use Rootant\Api\Exception\ResourceNonExistentException;

class ArticleController extends CommonController
{
    public function __construct(Authorizer $authorizer)
    {
        parent::__construct($authorizer);
        $this->beforeFilter('oauth',
            ['except' => ['index', 'column', 'show', 'commentList', 'search', 'comment', 'anonymousReply', 'getImageNews']]
        );
        $this->beforeFilter('validation');
    }

    private static $_validate = [
        'comment' => [
            'content' => 'required',
        ],
        'commentList' => [
            'type' => 'required|integer',
        ],
        'show' => [
            'type' => 'integer',
        ],
        'star' => [
            'type' => 'integer',
        ],
    ];

    public function index()
    {
        $this->articles = $this->getArticleList();

        // $this->articles = $this->setAd();
        // 首页栏目信息
        $initColumns = $this->indexColumn();

        return array_merge(['articles' => $this->articles], ['init_columns' => (array) $initColumns]);
    }

    protected function setAd()
    {
        if ($this->symbol === '1') {
            return $this->addFirstAd();
        }

        return $this->addPageAds();
    }

    protected function advertisement()
    {
        return DB::table('advertisement')
            ->select('url as PicName');
    }

    protected function getPageAds()
    {
        return $this->advertisement()
            ->skip(1 + 2 * ($this->symbol - 2))
            ->take(2)
            ->get();
    }

    protected function addPageAds()
    {
        $pageAds = $this->getPageAds();

        $slicedArr = array_slice($this->articles, 0, 5);
        if (isset($pageAds[0])) {
            array_push($slicedArr, $pageAds[0]);
        }

        $restArr = array_slice($this->articles, 5, 10);
        if (isset($pageAds[1])) {
            array_push($restArr, $pageAds[1]);
        }

        return array_merge($slicedArr, $restArr);
    }

    protected function getFirstAd()
    {
        return $this->advertisement()
            ->first();
    }

    protected function addFirstAd()
    {
        $firstAd = $this->getFirstAd();
        // 假设每页显示数据条目数 10
        $slicedArr = array_slice($this->articles, 0, 3);
        // 如果没有第一条广告则不添加
        if ($firstAd) {
            array_push($slicedArr, $firstAd);
        }
        $restArr = array_slice($this->articles, 3, 7);

        return array_merge($slicedArr, $restArr);
    }

    /**
     * 首页栏目
     *
     * @return array
     */
    private function indexColumn()
    {
        $uid = $this->getUid();
        if ($uid === '') {
            return [];
        }

        $column = DB::table('user_column')
            ->select('column_ids')
            ->where('user_id', $uid)
            ->first();
        if ($column === null) {
            return [];
        }

        $columnIds = $column->column_ids;
        // string -> array
        $ids = explode(',', $columnIds);

        return DB::table('column')
            ->select('pid as id', 'name')
            ->whereIn('id', $ids)
            ->get();
    }

    /**
     * 栏目列表
     *
     * @return array
     */
    public function column()
    {
        $ids = Input::get('ids', '');

        $ids_arr = array_filter(explode(',', $ids), 'is_numeric');
        $ids_arr = array_map('intval', $ids_arr);

        $columns = DB::table('column')
            ->select('pid as id', 'id as cid', 'name')
            ->get();
        foreach ($columns as $v) {
            if (in_array($v->id, $ids_arr, true)) {
                $v->selected = true;
            } else {
                $v->selected = false;
            }
        }

        return $columns;
    }

    /**
     * 文章详情
     *
     * @param  string $id 文章id
     * @return array
     */
    public function show($id)
    {
        $this->isImageNews();

        $functionName = ($this->imageFlag === 1)
            ? 'getImageNews' : 'getArticle';

        $article = $this->{$functionName}($id);
        // 处理获取的远端图片
        $article->Body = preg_replace('#(src=")/#', "\$1".'http://img.chinashippinginfo.net/', $article->Body);
        // 判断文章是否收藏
        $article->is_starred = $this->isStarred($id);
        // 相关文章
        $this->title = $article->Title;
        $relatedArticles = $this->relatedArticle($id);

        $tmpArticle = clone $article;
        unset($tmpArticle->Body, $tmpArticle->is_starred, $tmpArticle->PicName, $tmpArticle->ShareLink);

        // 热门评论
        $hotComments = $this->getHotComment($id, $tmpArticle);

        return array_merge(['article' => $article], ['related_articles' => $relatedArticles], ['hot_comments' => $hotComments]);
    }

    protected function isStarred($articleId)
    {
        if (! $this->accessToken) {
            return false;
        }

        $uid = $this->getOwnerId();

        return $this->checkUserStar($uid, $articleId);
    }

    /**
     * 文章的热门评论
     *
     * @param  int    $article_id 文章id
     * @param  object $article    文章的内容
     * @return array
     */
    protected function getHotComment($articleId, $article)
    {
        $commentIds = DB::table('article_comment')
            ->where('article_id', $articleId)
            ->latest('favours')
            ->take(2)
            ->lists('id');

        $comments = array();
        foreach ($commentIds as $id) {
            $comments[] = $this->getCommentById($id);
        }

        foreach ($comments as $comment) {
            $comment->flag = 1;
            $comment->article = $article;
            unset($comment->user_id, $comment->user_ip);
        }

        return $comments;
    }

    /**
     * 相关文章
     *
     * @return array
     */
    protected function relatedArticle($id)
    {
        $tag = $this->getTagForRelatedArticle($id);

        if ($tag === '') {
            return [];
        }

        $articles = $this->searchRelatedArticle($tag);

        return $articles;
    }

    protected function getTagForRelatedArticle($id)
    {
        $tag = $this->getTagStr($this->title);

        return ($tag === '')
            ? $this->getTagForArticle($id)
            : $tag;
    }

    /**
     * 获取关联文章的id
     *
     */
    protected function relatedArticleIds($id, $tags)
    {
        $article = DB::table('article');

        return DB::table('article')
            ->where('aid', '<>', $id)
            ->where('tags', $tags)
            ->take(2)
            ->lists('aid');
    }

    /**
     * 收藏文章
     *
     * @param  string $id 文章id
     */
    public function star($id)
    {
        $uid = $this->authorizer->getResourceOwnerId();

        $this->isImageNews();

        if ($this->checkUserStar($uid, $id)) {
            throw new DuplicateOperationException('您已收藏:(');
        }

        $insertId = $this->models['star']->insertGetId([
                'user_id'    => $uid,
                'article_id' => $id,
                'image_flag' => $this->imageFlag,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);

        return (array) $this->models['star']->find($insertId);
    }

    /**
     * 文章取消收藏
     *
     * @param  string $id 文章id
     */
    public function unstar($id)
    {
        $uid = $this->authorizer->getresourceOwnerId();

        $this->isImageNews();

        DB::table('star')->where('user_id', $uid)
            ->where('article_id', $id)
            ->where('image_flag', $this->imageFlag)
            ->delete();

        return Response::make('', 204);
    }

    /**
     * 文章评论
     *
     * @param  string $id 文章id
     */
    public function comment($id)
    {
        $this->isImageNews();

        $this->content = Input::get('content');
        $this->models['comment'] = DB::table('article_comment');
        $this->tag = $this->getTagStr($this->content);

        if ($this->accessToken) {
            $this->uid = $this->authorizer->getResourceOwnerId();

            $insertData = array_merge($this->commentDataIntersection($id), ['user_id' => $this->uid]);

            $this->insertId = $this->models['comment']->insertGetId($insertData);
        } else {
            // 匿名评论文章
            $this->commentAnonymous($id);
        }

        $comment = $this->models['comment']
            ->select('id', 'user_id', 'favours', 'content', 'created_at')
            ->find($this->insertId);

        $comment->flag = 1;
        $comment->user = $this->getOwner();
        unset($comment->user_id);

        return (array) $comment;
    }

    /**
     * 匿名评论文章
     *
     * @param  int $articleId
     * @return void
     */
    protected function commentAnonymous($articleId)
    {
        // 校验验证码
        MultiplexController::verifyCaptcha();
        $this->ip = Request::ip();

        $insertData = array_merge($this->commentDataIntersection($articleId), ['user_ip' => $this->ip]);

        $this->insertId = $this->models['comment']->insertGetId($insertData);
    }

    /**
     * 公共数据方法
     *
     * @param  int $articleId
     * @return array
     */
    protected function commentDataIntersection($articleId)
    {
        return [
            'article_id' => $articleId,
            'image_flag' => $this->imageFlag,
            'content'    => $this->content,
            'tag'        => $this->tag,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ];
    }

    /**
     * 文章评论列表
     *
     * @param  string $id 文章id
     */
    public function commentList($id)
    {
        $type = Input::get('type');

        $functionName = ($type === '8') ? 'getImageNews' : 'getArticle';

        $article = $this->{$functionName}($id);
        if ($article) {
            unset($article->Body, $article->ShareLink, $article->PicName);
        }

        $this->models['comment'] = DB::table('article_comment');

        $commentIds = $this->models['comment']
            ->select('id', 'user_id', 'user_ip', 'favours', 'content', 'created_at', 'image_flag')
            ->where('article_id', $id)
            ->latest('created_at')
            ->take(3)
            ->lists('id');

        $comments = array();
        foreach ($commentIds as $commentId) {
            $comments[] = $this->getCommentById($commentId);
        }

        foreach ($comments as $comment) {
            $comment->flag = 1;
            $comment->article = $article;
        }

        $extraComments = $this->extraComment($id, $article->Title);

        return ['lists' => $comments, 'extras' => $extraComments];
    }

    protected function extraComment($articleId, $articleTitle)
    {
        $this->articleId = $articleId;
        $this->title     = $articleTitle;

        $tag = $this->getTagForExtraComment($articleTitle);

        $sisi_comment = $this->getSisiComment($tag);
        $csp_comment  = $this->getCspComment($tag);

        return array_merge($sisi_comment, $csp_comment);
    }

    protected function getTagForExtraComment()
    {
        $tag = $this->getTagStr($this->title);

        return ($tag === '')
            ? $this->getTagForComment()
            : $tag;
    }

    /**
     * 搜索文章
     *
     */
    public function search()
    {
        return $this->searchArticle();
    }
}