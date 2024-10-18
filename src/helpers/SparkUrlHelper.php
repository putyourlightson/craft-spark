<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\helpers;

use Craft;
use craft\helpers\UrlHelper;
use putyourlightson\spark\models\ConfigModel;
use Twig\Error\SyntaxError;

class SparkUrlHelper
{
    public static function sparkUrl(string $template, array $variables = [], bool $sendCsrfToken = false): string
    {
        $config = new ConfigModel([
            'siteId' => Craft::$app->getSites()->getCurrentSite()->id,
            'template' => $template,
            'variables' => $variables,
            'sendCsrfToken' => $sendCsrfToken,
        ]);

        if (!$config->validate()) {
            throw new SyntaxError(implode(' ', $config->getFirstErrors()));
        }

        return UrlHelper::actionUrl('spark/response', [
            'config' => $config->getHashed(),
        ]);
    }
}
