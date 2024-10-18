<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\helpers;

use Craft;
use craft\helpers\Template;
use craft\helpers\UrlHelper;
use putyourlightson\spark\models\ConfigModel;
use Twig\Error\SyntaxError;
use Twig\Markup;

class SparkUrlHelper
{
    public static function sparkUrl(string $template, array $variables = [], bool $csrf = false): Markup
    {
        $config = new ConfigModel([
            'siteId' => Craft::$app->getSites()->getCurrentSite()->id,
            'template' => $template,
            'variables' => $variables,
            'csrf' => $csrf,
        ]);

        if (!$config->validate()) {
            throw new SyntaxError(implode(' ', $config->getFirstErrors()));
        }

        $url = UrlHelper::actionUrl('spark/response', [
            'config' => $config->getHashed(),
        ]);

        return Template::raw($url);
    }
}
