<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\variables;

use Craft;
use craft\base\Event;
use craft\events\AssetBundleEvent;
use craft\helpers\UrlHelper;
use craft\web\View;
use putyourlightson\spark\assets\DatastarAssetBundle;
use putyourlightson\spark\models\ConfigModel;
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
     * Returns whether the request is a Spark request.
     * This method is intentionally named `getIsRequest` so that Twig autocompletes it as `spark.isRequest`.
     */
    public function getIsRequest(): bool
    {
        return Craft::$app->getRequest()->getHeaders()->get('datastar-request') === 'true';
    }

    /**
     * Runs a controller action and returns the response data.
     */
    public function runAction(string $route, array $params): ?array
    {
        return Spark::$plugin->response->runAction($route, $params);
    }

    /**
     * Sends a fragment event.
     */
    public function sendFragment(string $content, array $options): void
    {
        Spark::$plugin->response->sendFragment($content, $options);
    }

    /**
     * Sends a signal event.
     */
    public function sendSignal(array $values): void
    {
        Spark::$plugin->response->sendSignal($values);
    }

    /**
     * Sends a delete event.
     */
    public function sendDelete(string $selector): void
    {
        Spark::$plugin->response->sendDelete($selector);
    }

    /**
     * Sends a redirect event.
     */
    public function sendRedirect(string $content): void
    {
        Spark::$plugin->response->sendRedirect($content);
    }

    /**
     * Sends a console event.
     */
    public function sendConsole(string $content): void
    {
        Spark::$plugin->response->sendConsole($content);
    }

    /**
     * Register the Datastar script.
     */
    public function registerScript(): void
    {
        $options = [
            'type' => 'module',
            'defer' => true,
        ];

        Event::on(View::class, View::EVENT_AFTER_REGISTER_ASSET_BUNDLE,
            function(AssetBundleEvent $event) use ($options) {
                if ($event->bundle instanceof DatastarAssetBundle) {
                    $event->bundle->jsOptions = $options;
                }
            }
        );

        $bundle = Craft::$app->getView()->registerAssetBundle(DatastarAssetBundle::class);

        // Register the JS file explicitly so that it will be output when using template caching.
        $url = Craft::$app->getView()->getAssetManager()->getAssetUrl($bundle, $bundle->js[0]);
        Craft::$app->getView()->registerJsFile($url, $options);
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
