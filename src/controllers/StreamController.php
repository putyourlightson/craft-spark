<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\controllers;

use craft\web\Controller;
use putyourlightson\spark\Spark;
use yii\web\Response;

class StreamController extends Controller
{
    /**
     * @inheritdoc
     */
    protected int|bool|array $allowAnonymous = true;

    /**
     * @inheritdoc
     */
    public $enableCsrfValidation = false;

    public function actionIndex(): Response
    {
        $this->response->getHeaders()
            ->set('Cache-Control', 'no-cache')
            ->set('Content-Type', 'text/event-stream');

        $this->response->format = Response::FORMAT_RAW;
        $this->response->stream = function() {
            return Spark::$plugin->stream->process($this->request);
        };

        return $this->response;
    }
}
