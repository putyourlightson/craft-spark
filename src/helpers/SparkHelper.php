<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\helpers;

use Craft;
use craft\helpers\UrlHelper;
use putyourlightson\spark\models\ConfigModel;
use Twig\Error\SyntaxError;

class SparkHelper
{
    public const ALLOWED_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

    /**
     * Returns the Spark URL endpoint, wrapped in an action function.
     */
    public static function spark(string $template, array $variables = [], string $method = 'get'): string
    {
        $method = self::getValidMethod($method);
        $url = self::sparkUrl($template, $variables, $method);

        return "$$$method('$url')";
    }

    /**
     * Returns the Spark URL endpoint.
     */
    public static function sparkUrl(string $template, array $variables = [], string $method = 'get'): string
    {
        $config = new ConfigModel([
            'siteId' => Craft::$app->getSites()->getCurrentSite()->id,
            'template' => $template,
            'variables' => $variables,
            'method' => self::getValidMethod($method),
        ]);

        if (!$config->validate()) {
            throw new SyntaxError(implode(' ', $config->getFirstErrors()));
        }

        return UrlHelper::actionUrl('spark/response', [
            'config' => $config->getHashed(),
        ]);
    }

    private static function getValidMethod(string $method): string
    {
        $method = strtolower($method);
        if (!in_array($method, static::ALLOWED_METHODS)) {
            throw new SyntaxError('Method must be one of ' . implode(', ', self::ALLOWED_METHODS));
        }

        return $method;
    }
}
