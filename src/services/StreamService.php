<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\services;

use Craft;
use craft\base\Component;
use craft\helpers\Json;
use craft\web\Request;
use craft\web\View;
use Generator;
use putyourlightson\spark\models\ConfigModel;
use putyourlightson\spark\models\EventModel;
use yii\web\BadRequestHttpException;
use yii\web\Response;

class StreamService extends Component
{
    /**
     * @var int The current event ID.
     */
    private int $id = 0;

    /**
     * @var array The current action response.
     */
    private array $actionResponse = [];

    /**
     * @var array<EventModel> The events to stream.
     */
    private array $events = [];

    /**
     * @var array Options to use for the current event.
     */
    private array $options = [];

    /**
     * Adds a fragment event to the stream.
     */
    public function addFragment(string $content, array $options): void
    {
        $this->addEvent('fragment', $content, $options);
    }

    /**
     * Adds a signal event to the stream.
     */
    public function addSignal(array $values): void
    {
        $this->addEvent('signal', Json::encode($values));
    }

    /**
     * Sets options for the current event.
     */
    public function setOptions(array $options): void
    {
        $this->options = $options;
    }

    /**
     * Processes the event stream.
     */
    public function process(Request $request): Generator
    {
        $config = $this->getValidatedConfig($request);
        $params = $this->getDatastarParams($request);

        Craft::$app->getSites()->setCurrentSite($config->siteId);

        foreach ($config->values as $value) {
            $route = $value[0];
            $params = array_merge($value[1], $params);
            $this->runActionOrRenderTemplate($route, $params);

            foreach ($this->events as $event) {
                yield $event->getOutput();
            }

            $this->events = [];
        }
    }

    private function addEvent(string $type, string $content, array $options = []): void
    {
        $this->id++;

        $event = new EventModel([
            'id' => $this->id,
            'type' => $type,
            'content' => $content,
        ]);

        $event->setAttributes($options);

        $this->events[] = $event;
    }

    private function getValidatedConfig(Request $request): ConfigModel
    {
        $param = $request->getParam('config');
        if ($param === null) {
            $this->throwException('No config param provided.');
        }

        $data = Craft::$app->getSecurity()->validateData($param);
        if ($data === false) {
            $this->throwException('Submitted data was tampered.');
        }

        $config = new ConfigModel(Json::decodeIfJson($data));

        foreach ($config->values as &$value) {
            if (is_string($value)) {
                $value = [$value, []];
            }
        }

        if ($config->csrfToken !== null) {
            $request->setBodyParams(array_merge(
                $request->getBodyParams(),
                [$request->csrfParam => $config->csrfToken]
            ));
        }

        return $config;
    }

    private function getDatastarParams(Request $request): array
    {
        if ($request->getIsGet()) {
            $param = $request->getParam('datastar', []);
            if ($param === null) {
                return [];
            }

            return Json::decodeIfJson($param);
        }

        return $request->getBodyParams();
    }

    private function runActionOrRenderTemplate(mixed $route, array $params): void
    {
        if (Craft::$app->createController($route) !== false) {
            $this->runAction($route, $params);
        } elseif (Craft::$app->getView()->doesTemplateExist($route, View::TEMPLATE_MODE_SITE)) {
            $this->renderTemplate($route, $params);
        }
    }

    private function runAction(string $route, array $params): void
    {
        Craft::$app->getRequest()->getHeaders()->set('Accept', 'application/json');

        $response = Craft::$app->runAction($route, $params);
        $this->actionResponse = $response->data;
    }

    private function renderTemplate(mixed $route, array $params): void
    {
        $variables = array_merge($this->actionResponse, $params);
        $content = Craft::$app->getView()->renderTemplate($route, $variables, View::TEMPLATE_MODE_SITE);

        if ($content) {
            $this->addFragment($content, $this->options);
        }

        $this->options = [];
    }

    private function throwException(string $message): void
    {
        Craft::$app->getResponse()->format = Response::FORMAT_HTML;

        throw new BadRequestHttpException($message);
    }
}
