<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\plugin;

use craft\base\Plugin as BasePlugin;
use putyourlightson\spark\Spark;

class Plugin extends BasePlugin
{
    public function init(): void
    {
        parent::init();

        Spark::bootstrap();
    }
}
