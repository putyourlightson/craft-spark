<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\twigextensions;

use putyourlightson\spark\models\ConsoleModel;
use putyourlightson\spark\Spark;
use yii\web\Response;

class SparkGlobal
{
    /**
     * Runs an action and returns the response.
     */
    public function runAction(string $route, array $params = []): Response
    {
        return Spark::$plugin->response->runAction($route, $params);
    }

    /**
     * Removes all elements that match the selector from the DOM.
     */
    public function remove(string $selector): void
    {
        Spark::$plugin->response->remove($selector);
    }

    /**
     * Redirects the page to the provided URI.
     */
    public function redirect(string $uri): void
    {
        Spark::$plugin->response->redirect($uri);
    }

    /**
     * Returns a console variable for logging messages to the browser console.
     */
    public function console(): ConsoleModel
    {
        return new ConsoleModel();
    }
}
