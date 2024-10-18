<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\twigextensions;

use putyourlightson\spark\helpers\SparkUrlHelper;
use putyourlightson\spark\variables\SparkVariable;
use Twig\Extension\AbstractExtension;
use Twig\Extension\GlobalsInterface;
use Twig\TwigFunction;

class SparkTwigExtension extends AbstractExtension implements GlobalsInterface
{
    /**
     * @inheritdoc
     */
    public function getFunctions(): array
    {
        return [
            new TwigFunction('sparkUrl', [SparkUrlHelper::class, 'sparkUrl']),
        ];
    }

    /**
     * @inerhitdoc
     */
    public function getGlobals(): array
    {
        return [
            'spark' => new SparkVariable(),
        ];
    }
}
