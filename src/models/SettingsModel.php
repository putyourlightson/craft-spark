<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\models;

use craft\base\Model;

class SettingsModel extends Model
{
    /**
     * Whether to register the Datastar script on the front-end.
     */
    public bool $registerScript = true;
}
