<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark;

use Craft;
use craft\base\Plugin;
use putyourlightson\spark\services\ResponseService;
use putyourlightson\spark\twigextensions\SparkTwigExtension;

/**
 * @property-read ResponseService $response
 */
class Spark extends Plugin
{
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
        $this->registerJsFile();
    }

    private function registerTwigExtension(): void
    {
        Craft::$app->view->registerTwigExtension(new SparkTwigExtension());
    }

    private function registerJsFile(): void
    {
        if (Craft::$app->getRequest()->getIsSiteRequest()) {
            Craft::$app->getView()->registerJsFile('https://cdn.jsdelivr.net/npm/@sudodevnull/datastar', [
                'type' => 'module',
                'defer' => true,
            ]);
        }
    }
}
