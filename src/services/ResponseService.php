<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\services;

use Craft;
use craft\base\Component;
use craft\helpers\Json;
use craft\web\View;
use putyourlightson\datastar\DatastarEvent;
use putyourlightson\datastar\DatastarResponse;
use putyourlightson\spark\models\ConfigModel;
use yii\web\BadRequestHttpException;
use yii\web\Response;

class ResponseService extends Component
{
    /**
     * @var int The current event ID.
     */
    private int $id = 0;

    /**
     * @var ?DatastarResponse The Datastar response.
     */
    private ?DatastarResponse $response = null;

    /**
     * @inerhitdoc
     */
    public function init(): void
    {
        parent::init();

        $this->response = new DatastarResponse();
    }

    /**
     * Processes the response.
     */
    public function process(string $config, array $params): void
    {
        $config = $this->getValidatedConfig($config);
        Craft::$app->getSites()->setCurrentSite($config->siteId);

        $variables = array_merge($params, $config->variables);
        $this->renderTemplate($config->template, $variables);
    }

    /**
     * Runs a controller action and returns the response data.
     */
    public function runAction(string $route, array $params): ?array
    {
        Craft::$app->getRequest()->getHeaders()->set('Accept', 'application/json');
        $response = Craft::$app->runAction($route, $params);

        return is_array($response->data) ? $response->data : [];
    }

    /**
     * Adds an event to send a fragment.
     */
    public function sendFragment(string $content, array $options): void
    {
        $this->sendEvent('fragment', $content, $options);
    }

    /**
     * Adds an event to set the store values.
     */
    public function setStore(array $values): void
    {
        $this->sendEvent('signal', Json::encode($values));
    }

    private function sendEvent(string $type, string $content, array $options = []): void
    {
        $this->id++;

        $event = new DatastarEvent([
            'id' => $this->id,
            'type' => $type,
            'content' => $content,
        ]);

        foreach ($options as $key => $value) {
            $event->{$key} = $value;
        }

        $this->response->sendEvent($event);
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
