<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\models;

use craft\base\Model;

class FragmentOptionsModel extends Model
{
    public ?string $selector = null;
    public ?string $merge = null;
    public ?string $settle = null;
    public string|bool|null $vt = null;

    /**
     * Returns the non-empty options.
     */
    public function getOptions(): array
    {
        // Ensure `vt` is a string
        if (is_bool($this->vt)) {
            $this->vt = $this->vt ? 'true' : 'false';
        }

        return array_filter($this->getAttributes());
    }
}
