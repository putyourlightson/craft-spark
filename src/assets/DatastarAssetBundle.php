<?php

namespace putyourlightson\spark\assets;

use craft\web\AssetBundle;

class DatastarAssetBundle extends AssetBundle
{
    /**
     * @const string The Datastar version to load (must exist in `resources/lib/datastar/`).
     * Downloaded from https://cdn.jsdelivr.net/npm/@sudodevnull/datastar@{version}/dist/datastar.min.js
     */
    public const DATASTAR_VERSION = '0.19-beta';

    /**
     * @inheritdoc
     */
    public $sourcePath = __DIR__ . '/../resources/lib/datastar/' . self::DATASTAR_VERSION;

    /**
     * @inheritdoc
     */
    public $js = [
        'datastar.js',
    ];
}
