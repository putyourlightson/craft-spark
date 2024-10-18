<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\variables;

use Craft;
use craft\helpers\UrlHelper;
use putyourlightson\spark\models\ConfigModel;
use putyourlightson\spark\models\ConsoleModel;
use putyourlightson\spark\Spark;
use yii\web\BadRequestHttpException;

class SparkVariable
{
    /**
     * Returns a URL for a GET request.
     */
    public function get(string $template, array $variables = []): string
    {
        return $this->getMethodUrl('get', $template, $variables);
    }

    /**
     * Returns a URL for a POST request.
     */
    public function post(string $template, array $variables = []): string
    {
        return $this->getMethodUrl('post', $template, $variables);
    }

    /**
     * Returns a URL for a PUT request.
     */
    public function put(string $template, array $variables = []): string
    {
        return $this->getMethodUrl('put', $template, $variables);
    }

    /**
     * Returns a URL for a PATCH request.
     */
    public function patch(string $template, array $variables = []): string
    {
        return $this->getMethodUrl('patch', $template, $variables);
    }

    /**
     * Returns a URL for a DELETE request.
     */
    public function delete(string $template, array $variables = []): string
    {
        return $this->getMethodUrl('delete', $template, $variables);
    }

    /**
     * Removes elements that match the selector from the DOM.
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
     * Returns a console variable for logging messages to the console.
     */
    public function console(): ConsoleModel
    {
        return new ConsoleModel();
    }

    private function getMethodUrl(string $method, string $template, array $variables = []): string
    {
        $config = new ConfigModel([
            'siteId' => Craft::$app->getSites()->getCurrentSite()->id,
            'method' => $method,
            'template' => $template,
            'variables' => $variables,
        ]);

        if (!$config->validate()) {
            throw new BadRequestHttpException(implode(' ', $config->getFirstErrors()));
        }

        if ($method !== 'get') {
            $config->csrfToken = Craft::$app->getRequest()->csrfToken;
        }

        $url = UrlHelper::actionUrl('spark/response', [
            'config' => $config->getHashed(),
        ]);

        return "$$$method('$url')";
    }
}
