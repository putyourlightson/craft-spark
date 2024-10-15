<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\controllers;

use craft\helpers\Json;
use craft\web\Controller;
use putyourlightson\spark\Spark;

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

    public function actionIndex(): void
    {
        $config = $this->request->getParam('config');
        $params = $this->getParams();

        Spark::$plugin->response->process($config, $params);

        exit();
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
