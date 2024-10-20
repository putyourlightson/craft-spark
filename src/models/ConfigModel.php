<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\models;

use Craft;
use craft\base\Model;
use craft\helpers\Json;
use putyourlightson\spark\Spark;

class ConfigModel extends Model
{
    public ?int $siteId = null;
    public string $template = '';
    public array $variables = [];
    public string $method = 'get';
    public ?string $csrfToken = null;

    protected function defineRules(): array
    {
        return [
            [['siteId', 'template'], 'required'],
            [['siteId'], 'integer'],
            [['template', 'method'], 'string'],
            [['variables'], 'validateVariables'],
            [['method'], 'in', 'range' => ['get', 'post', 'put', 'patch', 'delete']],
        ];
    }

    /**
     * Validates that none of variables are objects recursively.
     *
     * @used-by defineRules()
     */
    public function validateVariables(mixed $attribute): bool
    {
        $storeVariableName = Spark::$plugin->settings->storeVariableName;

        foreach ($this->variables as $key => $value) {
            if ($key === $storeVariableName) {
                $this->addError($attribute, Craft::t('spark', 'Variable `' . $storeVariableName . '` is reserved. Use a different name or modify the name of the store variable using the `storeVariableName` config setting.'));

                return false;
            }

            if (is_object($value) || (is_array($value) && !$this->validateVariables($value))) {
                $this->addError($attribute, Craft::t('spark', 'Variable `' . $key . '` is an object, which is a forbidden variable type in the context of a Spark request.'));

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
        if ($this->method !== 'get') {
            $this->csrfToken = Craft::$app->getRequest()->csrfToken;
        }

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
