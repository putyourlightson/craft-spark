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
    public string $method = '';
    public string $template = '';
    public array $variables = [];
    public ?string $csrfToken = null;

    protected function defineRules(): array
    {
        return [
            [['siteId', 'method', 'template'], 'required'],
            [['siteId'], 'integer'],
            [['method'], 'in', 'range' => ['get', 'post', 'put', 'patch', 'delete']],
            [['template'], 'string'],
            [['variables'], 'validateVariables'],
        ];
    }

    /**
     * Validates that none of variables are objects recursively.
     *
     * @used-by defineRules()
     */
    public function validateVariables(mixed $attribute): bool
    {
        foreach ($this->variables as $value) {
            if (is_object($value) || (is_array($value) && !$this->validateVariables($value))) {
                $this->addError($attribute, Craft::t('spark', 'Variables passed into `spark.' . $this->method . '()` cannot contain objects.'));

                return false;
            }
        }

        return true;
    }

    /**
     * Returns a hashed, JSON-encoded array of attributes.
     */
    public function getHashed(): string
    {
        $attributes = array_filter([
            'siteId' => $this->siteId,
            'template' => $this->template,
            'variables' => $this->variables,
            'csrfToken' => $this->csrfToken,
        ]);
        $encoded = Json::encode($attributes);

        return Craft::$app->getSecurity()->hashData($encoded);
    }
}
