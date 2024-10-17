<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark;

use Craft;
use craft\base\Plugin;
use putyourlightson\spark\models\SettingsModel;
use putyourlightson\spark\services\ResponseService;
use putyourlightson\spark\twigextensions\SparkTwigExtension;

/**
 * @property-read ResponseService $response
 * @property-read SettingsModel $settings
 */
class Spark extends Plugin
{
    public const DATASTAR_VERSION = '0.19.2';

    /**
     * @inerhitdoc
     */
    public string $schemaVersion = '0.0.1';

    /**
     * @var Spark
     */
    public static Spark $plugin;

    /**
     * @inerhitdoc
     */
    public static function config(): array
    {
        return [
            'components' => [
                'response' => ['class' => ResponseService::class],
            ],
        ];
    }

    public function init(): void
    {
        parent::init();
        self::$plugin = $this;

        $this->registerTwigExtension();
        $this->registerScript();
    }

    /**
     * @inerhitdoc
     */
    protected function createSettingsModel(): SettingsModel
    {
        return new SettingsModel();
    }

    private function registerTwigExtension(): void
    {
        Craft::$app->view->registerTwigExtension(new SparkTwigExtension());
    }

    private function registerScript(): void
    {
        if (!$this->settings->registerScript) {
            return;
        }

        if (Craft::$app->getRequest()->getIsSiteRequest()) {
            $url = 'https://cdn.jsdelivr.net/npm/@sudodevnull/datastar@' . self::DATASTAR_VERSION;
            Craft::$app->getView()->registerJsFile($url, [
                'type' => 'module',
                'defer' => true,
            ]);
        }
    }
}
