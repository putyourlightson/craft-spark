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
        $store = $this->getStoreParams();

        // Clear out params to prevent them from being processed controller actions.
        $this->request->setQueryParams([]);
        $this->request->setBodyParams([]);

        // Set the response headers for the event stream.
        $this->response->getHeaders()->set('Content-Type', 'text/event-stream');
        $this->response->getHeaders()->set('Cache-Control', 'no-cache');
        $this->response->getHeaders()->set('Connection', 'keep-alive');

        // Disable buffering for Nginx.
        // https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_buffering
        $this->response->getHeaders()->set('X-Accel-Buffering', 'no');

        $this->response->format = Response::FORMAT_RAW;

        // Stream the response.
        $this->response->stream = function() use ($config, $store) {
            return Spark::$plugin->response->stream($config, $store);
        };

        return $this->response;
    }

    private function getStoreParams(): array
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
