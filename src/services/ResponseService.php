<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\services;

use Craft;
use craft\base\Component;
use craft\helpers\Json;
use craft\web\View;
use Generator;
use putyourlightson\spark\models\ConfigModel;
use putyourlightson\spark\models\EventModel;
use yii\web\BadRequestHttpException;
use yii\web\Response;

class ResponseService extends Component
{
    /**
     * @var int The current event ID.
     */
    private int $id = 0;

    /**
     * @var array<EventModel> The events to stream.
     */
    private array $events = [];

    /**
     * Returns whether the request is a Spark request.
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
        if (!$this->getIsRequest()) {
            return null;
        }

        Craft::$app->getRequest()->getHeaders()->set('Accept', 'application/json');
        $response = Craft::$app->runAction($route, $params);

        return is_array($response->data) ? $response->data : [];
    }

    /**
     * Adds an event to send a fragment.
     */
    public function sendFragment(string $content, array $options): void
    {
        $this->addEvent('fragment', $content, $options);
    }

    /**
     * Adds an event to set the store values.
     */
    public function setStore(array $values): void
    {
        $this->addEvent('signal', Json::encode($values));
    }

    /**
     * Streams events.
     */
    public function stream(string $config, array $params): Generator
    {
        $config = $this->getValidatedConfig($config);
        Craft::$app->getSites()->setCurrentSite($config->siteId);

        $variables = array_merge($params, $config->variables);
        $this->renderTemplate($config->template, $variables);

        foreach ($this->events as $event) {
            yield $event->getOutput();
        }
    }

    private function addEvent(string $type, string $content, array $options = []): void
    {
        if (!$this->getIsRequest()) {
            return;
        }

        $this->id++;

        $event = new EventModel([
            'id' => $this->id,
            'type' => $type,
            'content' => $content,
        ]);

        $event->setAttributes($options);

        $this->events[] = $event;
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

    private function renderTemplate(string $template, array $variables): void
    {
        if (!Craft::$app->getView()->doesTemplateExist($template, View::TEMPLATE_MODE_SITE)) {
            $this->throwException('Template `' . $template . '` does not exist.');
        }

        Craft::$app->getView()->renderTemplate($template, $variables, View::TEMPLATE_MODE_SITE);
    }

    private function throwException(string $message): void
    {
        Craft::$app->getResponse()->format = Response::FORMAT_HTML;

        throw new BadRequestHttpException($message);
    }
}
