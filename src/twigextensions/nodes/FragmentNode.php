<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\twigextensions\nodes;

use putyourlightson\spark\Spark;
use Twig\Compiler;
use Twig\Node\Node;

class FragmentNode extends Node
{
    /**
     * @inheritdoc
     */
    public function compile(Compiler $compiler): void
    {
        $options = $this->hasNode('options') ? $this->getNode('options') : null;

        $compiler
            ->addDebugInfo($this)
            ->write("ob_start();\n")
            ->subcompile($this->getNode('body'))
            ->write("\$content = ob_get_clean();\n")
            ->write("\$options = ");

        if ($options) {
            $compiler->subcompile($options);
        } else {
            $compiler->raw('[]');
        }

        $compiler
            ->raw(";\n")
            ->write(Spark::class . "::\$plugin->response->sendFragment(\$content, \$options);\n")
            ->write("echo \$content;\n");
    }
}

