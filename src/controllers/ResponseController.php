<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\controllers;

use craft\helpers\Json;
use craft\web\Controller;
use putyourlightson\spark\Spark;
use yii\web\Response;

class ResponseController extends Controller
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
        $config = $this->request->getParam('config');
        $params = $this->getParams();

        // Set the request to accept JSON so that controller actions return data in their responses.
        $this->request->getHeaders()->set('Accept', 'application/json');

        $this->response->format = Response::FORMAT_RAW;
        $this->response->data = Spark::$plugin->response->process($config, $params);

        // Set the response headers for the event stream.
        $this->response->getHeaders()->set('Content-Type', 'text/event-stream');
        $this->response->getHeaders()->set('Cache-Control', 'no-cache');
        $this->response->getHeaders()->set('Connection', 'keep-alive');

        return $this->response;
    }

    private function getParams()
    {
        if ($this->request->getIsGet()) {
            $param = $this->request->getParam('datastar', []);
            if ($param === null) {
                return [];
            }

            return Json::decodeIfJson($param);
        }

        return $this->request->getBodyParams();
    }
}
