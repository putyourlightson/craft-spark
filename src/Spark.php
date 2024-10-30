<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark;

use Craft;
use craft\base\Plugin;
use nystudio107\autocomplete\events\DefineGeneratorValuesEvent;
use nystudio107\autocomplete\generators\AutocompleteTwigExtensionGenerator;
use putyourlightson\spark\assets\DatastarAssetBundle;
use putyourlightson\spark\models\SettingsModel;
use putyourlightson\spark\models\StoreModel;
use putyourlightson\spark\services\ResponseService;
use putyourlightson\spark\twigextensions\SparkTwigExtension;
use yii\base\Event;

/**
 * @property-read ResponseService $response
 * @property-read SettingsModel $settings
 */
class Spark extends Plugin
{
    public const DATASTAR_VERSION = '0.19.9';

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
        $this->registerAutocompleteEvent();
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
        Craft::$app->getView()->registerTwigExtension(new SparkTwigExtension());
    }

    private function registerScript(): void
    {
        if (!$this->settings->registerScript) {
            return;
        }

        $bundle = Craft::$app->getView()->registerAssetBundle(DatastarAssetBundle::class);

        // Register the JS file explicitly so that it will be output when using template caching.
        $url = Craft::$app->getView()->getAssetManager()->getAssetUrl($bundle, $bundle->js[0]);
        Craft::$app->getView()->registerJsFile($url, $bundle->jsOptions);
    }

    private function registerAutocompleteEvent(): void
    {
        if (!class_exists('nystudio107\autocomplete\generators\AutocompleteTwigExtensionGenerator')) {
            return;
        }

        Event::on(AutocompleteTwigExtensionGenerator::class,
            AutocompleteTwigExtensionGenerator::EVENT_BEFORE_GENERATE,
            function(DefineGeneratorValuesEvent $event) {
                $event->values[$this->settings->storeVariableName] = 'new \\' . StoreModel::class . '()';
            }
        );
    }
}
