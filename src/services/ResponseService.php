<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\services;

use Craft;
use craft\base\Component;
use craft\helpers\Json;
use craft\web\View;
use putyourlightson\datastar\events\ConsoleEvent;
use putyourlightson\datastar\events\DeleteEvent;
use putyourlightson\datastar\events\EventInterface;
use putyourlightson\datastar\events\FragmentEvent;
use putyourlightson\datastar\events\RedirectEvent;
use putyourlightson\datastar\events\SignalEvent;
use putyourlightson\spark\models\ConfigModel;
use putyourlightson\spark\models\StoreModel;
use putyourlightson\spark\Spark;
use Throwable;
use yii\web\BadRequestHttpException;
use yii\web\Response;

class ResponseService extends Component
{
    /**
     * @var string|null The CSRF token to include in the response.
     */
    private ?string $csrfToken = null;

    /**
     * Streams the response and returns an empty array.
     */
    public function stream(string $config, array $store): array
    {
        $config = $this->getConfigForResponse($config);
        Craft::$app->getSites()->setCurrentSite($config->siteId);
        $this->csrfToken = $config->csrfToken;

        $store = new StoreModel($store);
        $variables = array_merge(
            [Spark::$plugin->settings->storeVariableName => $store],
            $config->variables,
        );

        $content = $this->renderTemplate($config->template, $variables);

        // Output any rendered content in a fragment event.
        if (!empty($content)) {
            $this->fragment($content);
        }

        return [];
    }

    /**
     * Runs an action and returns the response.
     */
    public function runAction(string $route, array $params = []): Response
    {
        $request = Craft::$app->getRequest();
        $request->getHeaders()->set('Accept', 'application/json');

        if ($this->csrfToken !== null) {
            $params[$request->csrfParam] = $this->csrfToken;
        }

        if ($request->getIsGet()) {
            $request->setQueryParams($params);
        } else {
            $request->setBodyParams($params);
        }

        $response = Craft::$app->runAction($route);

        $request->setQueryParams([]);
        $request->setBodyParams([]);

        return $response;
    }

    /**
     * Merges a fragment into the DOM.
     */
    public function fragment(string $content, array $options = []): void
    {
        // Merge and remove empty values
        $options = array_filter(array_merge(
            Spark::$plugin->settings->defaultFragmentOptions,
            $options
        ));

        $this->sendEvent(FragmentEvent::class, $content, $options);
    }

    /**
     * Sets store values.
     */
    public function store(array $values): void
    {
        $this->sendEvent(SignalEvent::class, '', ['store' => Json::encode($values)]);
    }

    /**
     * Removes all elements that match the selector from the DOM.
     */
    public function remove(string $selector): void
    {
        $this->sendEvent(DeleteEvent::class, '', ['selector' => $selector]);
    }

    /**
     * Redirects the page to the provided URI.
     */
    public function redirect(string $uri): void
    {
        $this->sendEvent(RedirectEvent::class, $uri);
    }

    /**
     * Outputs a message to the browser console.
     */
    public function console(string $message, string $mode = 'log'): void
    {
        $this->sendEvent(ConsoleEvent::class, $message, ['mode' => $mode]);
    }

    /**
     * Throws an exception with the appropriate formats for easier debugging.
     *
     * @phpstan-return never
     */
    public function throwException(Throwable|string $exception): void
    {
        Craft::$app->getRequest()->getHeaders()->set('Accept', 'text/html');
        Craft::$app->getResponse()->format = Response::FORMAT_HTML;

        if ($exception instanceof Throwable) {
            throw $exception;
        }

        throw new BadRequestHttpException($exception);
    }

    private function getConfigForResponse(string $config): ConfigModel
    {
        $data = Craft::$app->getSecurity()->validateData($config);
        if ($data === false) {
            $this->throwException('Submitted data was tampered.');
        }

        return new ConfigModel(Json::decodeIfJson($data));
    }

    private function renderTemplate(string $template, array $variables): string
    {
        if (!Craft::$app->getView()->doesTemplateExist($template, View::TEMPLATE_MODE_SITE)) {
            $this->throwException('Template `' . $template . '` does not exist.');
        }

        try {
            return Craft::$app->getView()->renderTemplate($template, $variables, View::TEMPLATE_MODE_SITE);
        } catch (Throwable $exception) {
            $this->throwException($exception);
        }
    }

    private function sendEvent(string $class, string $content = '', array $options = []): void
    {
        /** @var EventInterface $event */
        $event = new $class();

        if (property_exists($event, 'content')) {
            $event->content = $content;
        }

        foreach ($options as $key => $value) {
            $event->{$key} = $value;
        }

        $this->flushEvent($event);
    }

    private function flushEvent(EventInterface $event): void
    {
        // Capture inline content before ending output buffers.
        $inlineContent = ob_get_contents();

        // Clean and end all existing output buffers.
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        // Output inline content as a fragment event.
        if ($inlineContent !== false) {
            $fragment = new FragmentEvent();
            $fragment->content = $inlineContent;
            echo $fragment->getOutput();
        }

        echo $event->getOutput();

        flush();

        // Start a new output buffer to capture any subsequent inline content.
        ob_start();
    }
}
