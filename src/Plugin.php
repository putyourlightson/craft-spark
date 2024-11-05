<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\plugin;

use craft\base\Model;
use craft\base\Plugin as BasePlugin;
use putyourlightson\spark\models\SettingsModel;
use putyourlightson\spark\Spark;

class Plugin extends BasePlugin
{
    public function init(): void
    {
        parent::init();

        Spark::bootstrap();
    }

    /**
     * This method is implemented in order to prevent warnings about attempting to set settings on a plugin that doesn’t have settings when a `spark.php` config file exists.
     */
    public function getSettings(): Model
    {
        return new SettingsModel();
    }
}
