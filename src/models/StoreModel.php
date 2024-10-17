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
        return $this->values[$name] ?? null;
    }

    public function __set(string $name, mixed $value)
    {
        $this->values[$name] = $value;
        $this->modifiedValues[$name] = $value;

        return $this;
    }

    /**
     * This exists so that `store.{name}` and `store.{name}()` will work in Twig.
     */
    public function __call(string $name, array $arguments)
    {
        if (empty($arguments)) {
            return $this->__get($name);
        }

        return $this->__set($name, $arguments[0]);
    }

    public function getValues(): array
    {
        return $this->values;
    }

    public function getModifiedValues(): array
    {
        return $this->modifiedValues;
    }

    public function setValues(array $values): void
    {
        foreach ($values as $name => $value) {
            $this->__set($name, $value);
        }
    }
}
