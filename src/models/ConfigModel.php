<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\models;

use Craft;
use craft\base\Model;
use craft\helpers\Json;

class ConfigModel extends Model
{
    public ?int $siteId = null;
    public array $values = [];
    public ?string $csrfToken = null;

    /**
     * Returns a hashed, JSON-encoded array of non-empty config attributes.
     */
    public function getHashed(): string
    {
        $attributes = array_filter($this->getAttributes());
        $encoded = Json::encode($attributes);

        return Craft::$app->getSecurity()->hashData($encoded);
    }
}
