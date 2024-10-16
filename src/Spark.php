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
    }

    private function registerTwigExtension(): void
    {
        Craft::$app->view->registerTwigExtension(new SparkTwigExtension());
    }
}
