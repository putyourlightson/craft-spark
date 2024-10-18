<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace putyourlightson\spark\models;

class StoreModel
{
    private array $values;
    private array $modifiedValues = [];

    public function __construct(array $values)
    {
        $this->values = $values;
    }

    public function __get(string $name)
    {
        return $this->get($name);
    }

    /**
     * This exists so that `store.{name}` will work in Twig.
     */
    public function __call(string $name, array $arguments): mixed
    {
        if (empty($arguments)) {
            return $this->get($name);
        }

        return null;
    }

    public function get(string $name): mixed
    {
        return $this->values[$name] ?? null;
    }

    public function getValues(): array
    {
        return $this->values;
    }

    public function getModifiedValues(): array
    {
        return $this->modifiedValues;
    }

    public function set(string $name, mixed $value): static
    {
        $this->values[$name] = $value;
        $this->modifiedValues[$name] = $value;

        return $this;
    }

    public function setValues(array $values): static
    {
        foreach ($values as $name => $value) {
            $this->set($name, $value);
        }

        return $this;
    }
}
