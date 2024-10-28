<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\twigextensions;

use putyourlightson\spark\twigextensions\tokenparsers\FragmentTokenParser;
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
            new TwigFunction('spark', [SparkFunctions::class, 'spark']),
            new TwigFunction('sparkUrl', [SparkFunctions::class, 'sparkUrl']),
            new TwigFunction('sparkStore', [SparkFunctions::class, 'sparkStore']),
            new TwigFunction('sparkStoreFromClass', [SparkFunctions::class, 'sparkStoreFromClass']),
        ];
    }

    /**
     * @inerhitdoc
     */
    public function getGlobals(): array
    {
        return [
            'spark' => new SparkGlobal(),
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
