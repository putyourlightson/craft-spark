<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\twigextensions;

use putyourlightson\spark\twigextensions\tokenparsers\FragmentTokenParser;
use putyourlightson\spark\variables\SparkVariable;
use Twig\Extension\AbstractExtension;
use Twig\Extension\GlobalsInterface;

class SparkTwigExtension extends AbstractExtension implements GlobalsInterface
{
    /**
     * @inerhitdoc
     */
    public function getGlobals(): array
    {
        return [
            'spark' => new SparkVariable(),
        ];
    }

    /**
     * @inheritdoc
     */
    public function getTokenParsers(): array
    {
        return [
            new FragmentTokenParser(),
        ];
    }
}
