<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\models;

use craft\base\Model;

class EventModel extends Model
{
    public int $id = 0;
    public string $type = 'fragment';
    public string $content = '';
    public string $selector = '';
    public string $merge = 'morph_element';
    public string $settle = '0';
    public string $vt = 'false';

    protected function defineRules(): array
    {
        return [
            [['id'], 'integer'],
            [['type', 'content', 'selector', 'merge', 'settle', 'vt'], 'string'],
            [['type'], 'in', 'range' => ['fragment', 'signal']],
        ];
    }

    /**
     * Returns the output for this event if valid and not empty.
     */
    public function getOutput(): string
    {
        if (!$this->validate()) {
            return '';
        }

        $content = trim($this->content);
        if (empty($content)) {
            return '';
        }

        return match ($this->type) {
            'fragment' => $this->getFragmentOutput($content),
            'signal' => $this->getSignalOutput($content),
            default => '',
        };
    }

    private function getFragmentOutput(string $content): string
    {
        $output = [
            'event: datastar-fragment',
            'id: ' . $this->id,
            'data: selector ' . $this->selector,
            'data: merge ' . $this->merge,
            'data: settle ' . $this->settle,
            'data: vt ' . $this->vt,
            'data: fragment',
        ];

        $lines = explode("\n", $content);
        foreach ($lines as $line) {
            $output[] = 'data: ' . $line;
        }

        return $this->getStringOutput($output);
    }

    private function getSignalOutput(string $content): string
    {
        return $this->getStringOutput([
            'event: datastar-signal',
            'id: ' . $this->id,
            'data: ' . $content,
        ]);
    }

    private function getStringOutput(array $output): string
    {
        return implode("\n", $output) . "\n\n";
    }
}
