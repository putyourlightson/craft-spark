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
use Throwable;
use yii\web\BadRequestHttpException;
use yii\web\Response;

class ResponseService extends Component
{
    /**
     * @var EventInterface[] The events to send.
     */
    private array $events = [];

    /**
     * Processes the response and returns the event output.
     */
    public function process(string $config, array $store): string
    {
        $config = $this->getValidatedConfig($config);
        Craft::$app->getSites()->setCurrentSite($config->siteId);
        $variables = array_merge(['store' => $store], $config->variables);

        $content = $this->renderTemplate($config->template, $variables);
        if (!empty($content)) {
            $this->addEvent(FragmentEvent::class, $content);
        }

        $output = [];
        foreach ($this->events as $event) {
            $output[] = $event->getOutput();
        }

        return implode('', $output);
    }

    /**
     * Sets store values.
     */
    public function store(array|string $values): void
    {
        if (is_array($values)) {
            $values = Json::encode($values);
        }

        $this->addEvent(SignalEvent::class, '', ['store' => $values]);
    }

    /**
     * Removes elements that match the selector from the DOM.
     */
    public function remove(string $selector): void
    {
        $this->addEvent(DeleteEvent::class, '', ['selector' => $selector]);
    }

    /**
     * Redirects the page to the provided URI.
     */
    public function redirect(string $uri): void
    {
        $this->addEvent(RedirectEvent::class, $uri);
    }

    /**
     * Outputs a message to the console.
     */
    public function console(string $message, string $mode = 'log'): void
    {
        $this->addEvent(ConsoleEvent::class, $message, ['mode' => $mode]);
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

    private function getValidatedConfig(string $config): ConfigModel
    {
        $data = Craft::$app->getSecurity()->validateData($config);
        if ($data === false) {
            $this->throwException('Submitted data was tampered.');
        }

        $config = new ConfigModel(Json::decodeIfJson($data));

        if ($config->csrfToken !== null) {
            Craft::$app->getRequest()->setBodyParams(array_merge(
                Craft::$app->getRequest()->getBodyParams(),
                [Craft::$app->getRequest()->csrfParam => $config->csrfToken]
            ));
        }

        return $config;
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

    private function addEvent(string $class, string $content = '', array $options = []): void
    {
        /** @var EventInterface $event */
        $event = new $class();

        if (property_exists($event, 'content')) {
            $event->content = $content;
        }

        foreach ($options as $key => $value) {
            $event->{$key} = $value;
        }

        $this->events[] = $event;
    }
}
