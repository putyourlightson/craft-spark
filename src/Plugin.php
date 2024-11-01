<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\plugin;

use craft\base\Plugin as BasePlugin;
use putyourlightson\spark\Spark;

class Plugin extends BasePlugin
{
    /**
     * @inerhitdoc
     */
    public string $schemaVersion = '0.0.1';

    public function init(): void
    {
        parent::init();

        Spark::bootstrap();
    }
}
