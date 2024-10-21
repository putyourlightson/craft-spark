<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\twigextensions;

use putyourlightson\spark\helpers\SparkHelper;
use putyourlightson\spark\twigextensions\tokenparsers\FragmentTokenParser;
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
            new TwigFunction('spark', [SparkHelper::class, 'spark']),
            new TwigFunction('sparkUrl', [SparkHelper::class, 'sparkUrl']),
            new TwigFunction('sparkStore', [SparkHelper::class, 'sparkStore']),
            new TwigFunction('sparkStoreFromClass', [SparkHelper::class, 'sparkStoreFromClass']),
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
