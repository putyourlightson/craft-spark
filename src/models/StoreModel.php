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

    public function __set(string $name, mixed $value)
    {
        return $this->set($name, $value);
    }

    /**
     * This exists so that `store.{name}` and `store.{name}({value})` will work in Twig.
     */
    public function __call(string $name, array $arguments)
    {
        if (empty($arguments)) {
            return $this->get($name);
        }

        return $this->set($name, $arguments[0]);
    }

    /**
     * Returns the value in the store.
     */
    public function get(string $name): mixed
    {
        return $this->values[$name] ?? null;
    }

    /**
     * Returns the values in the store.
     */
    public function getValues(): array
    {
        return $this->values;
    }

    /**
     * Returns the modified values in the store.
     */
    public function getModifiedValues(): array
    {
        return $this->modifiedValues;
    }

    /**
     * Sets a value in the store.
     */
    public function set(string $name, mixed $value): static
    {
        $this->values[$name] = $value;
        $this->modifiedValues[$name] = $value;

        return $this;
    }

    /**
     * Sets multiple values in the store.
     */
    public function setValues(array $values): static
    {
        foreach ($values as $name => $value) {
            $this->set($name, $value);
        }

        return $this;
    }
}
