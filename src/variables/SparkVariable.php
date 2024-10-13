<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\variables;

use Craft;
use craft\helpers\UrlHelper;
use putyourlightson\spark\models\ConfigModel;
use putyourlightson\spark\Spark;

class SparkVariable
{
    /**
     * Returns a stream URL for a GET request.
     */
    public function get(array|string ...$values): string
    {
        return $this->getMethodUrl('get', $values);
    }

    /**
     * Returns a stream URL for a POST request.
     */
    public function post(array|string ...$values): string
    {
        return $this->getMethodUrl('post', $values);
    }

    /**
     * Returns a stream URL for a PUT request.
     */
    public function put(array|string ...$values): string
    {
        return $this->getMethodUrl('put', $values);
    }

    /**
     * Returns a stream URL for a PATCH request.
     */
    public function patch(array|string ...$values): string
    {
        return $this->getMethodUrl('patch', $values);
    }

    /**
     * Returns a stream URL for a DELETE request.
     */
    public function delete(array|string ...$values): string
    {
        return $this->getMethodUrl('delete', $values);
    }

    /**
     * Sets options for the current event.
     */
    public function options(array $options): void
    {
        Spark::$plugin->stream->setOptions($options);
    }

    /**
     * Adds a signal event to the stream.
     */
    public function signal(array $values): void
    {
        Spark::$plugin->stream->addSignal($values);
    }

    /**
     * Returns whether the request is a stream request.
     * This method is intentionally named `getIsRequest` so that Twig autocompletion suggests `isRequest`.
     */
    public function getIsRequest(): bool
    {
        return Craft::$app->getRequest()->getHeaders()->get('datastar-request') === 'true';
    }

    private function getMethodUrl(string $method, array $values): string
    {
        $config = new ConfigModel([
            'siteId' => Craft::$app->getSites()->getCurrentSite()->id,
            'values' => $values,
        ]);

        if ($method !== 'get') {
            $config->csrfToken = Craft::$app->getRequest()->csrfToken;
        }

        $url = UrlHelper::actionUrl('spark/stream', [
            'config' => $config->getHashed(),
        ]);

        return "$$$method('$url')";
    }
}
