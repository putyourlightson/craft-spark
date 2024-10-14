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

        $this->response->getHeaders()
            ->set('Cache-Control', 'no-cache')
            ->set('Content-Type', 'text/event-stream');

        $this->response->format = Response::FORMAT_RAW;
        $this->response->stream = function() use ($config, $params) {
            return Spark::$plugin->response->stream($config, $params);
        };

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
