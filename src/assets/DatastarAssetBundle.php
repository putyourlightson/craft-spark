<?php

namespace putyourlightson\spark\assets;

use craft\web\AssetBundle;
use putyourlightson\spark\Spark;

class DatastarAssetBundle extends AssetBundle
{
    /**
     * @inheritdoc
     */
    public $sourcePath = __DIR__ . '/../resources/lib/datastar/' . Spark::DATASTAR_VERSION;

    /**
     * @inheritdoc
     */
    public $js = [
        'datastar.js',
    ];

    /**
     * @inheritdoc
     */
    public $jsOptions = [
        'type' => 'module',
        'defer' => true,
    ];
}
