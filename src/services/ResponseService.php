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
use putyourlightson\datastar\events\ConsoleEvent;
use putyourlightson\datastar\events\DeleteEvent;
use putyourlightson\datastar\events\EventInterface;
use putyourlightson\datastar\events\FragmentEvent;
use putyourlightson\datastar\events\RedirectEvent;
use putyourlightson\datastar\events\SignalEvent;
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

        // Trigger Craft response events so that plugins can do their thing.
        Craft::$app->getResponse()->trigger(Response::EVENT_AFTER_PREPARE);
        Craft::$app->getResponse()->trigger(Response::EVENT_AFTER_SEND);

        $this->response->end();
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
     * Sends a fragment event.
     */
    public function sendFragment(string $content, array $options): void
    {
        $this->sendEvent(FragmentEvent::class, $content, $options);
    }

    /**
     * Sends a signal event.
     */
    public function sendSignal(array $values): void
    {
        $this->sendEvent(SignalEvent::class, '', ['store' => Json::encode($values)]);
    }

    /**
     * Sends a delete event.
     */
    public function sendDelete(string $selector): void
    {
        $this->sendEvent(DeleteEvent::class, '', ['selector' => $selector]);
    }

    /**
     * Sends a redirect event.
     */
    public function sendRedirect(string $content): void
    {
        $this->sendEvent(RedirectEvent::class, $content);
    }

    /**
     * Sends a console event.
     */
    public function sendConsole(string $content): void
    {
        $this->sendEvent(ConsoleEvent::class, $content);
    }

    private function sendEvent(string $class, string $content, array $options = []): void
    {
        $this->id++;

        /** @var EventInterface $event */
        $event = new $class();
        $event->id = $this->id;
        $event->content = $content;

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
