<p align="center"><img width="150" src="https://raw.githubusercontent.com/putyourlightson/craft-spark/develop/src/icon.svg"></p>

# Spark Plugin for Craft CMS

### A reactive hypermedia framework for Craft CMS.

Spark provides an integration between Craft CMS and [Datastar](https://data-star.dev), a JavaScript library that combines the features of [Alpine JS](https://alpinejs.dev/) with those of [htmx](https://htmx.org/). It advocates hypermedia-driven apps, meaning that you won’t find history support, JavaScript execution in responses, nor any other “bells and whistles”. This is intentional. By embracing the simplicity of hypermedia and the power of web components (natively or using [Lit](https://lit.dev/)), you can build highly performant and scalable apps.

Read the [Getting Started](https://data-star.dev/guide/getting_started) guide for Datastar.

> [!WARNING]  
> **This plugin is experimental and its API is likely to change – do _not_ use in production!**  
> For a stable, feature-rich alternative, consider using [Sprig](https://putyourlightson.com/sprig) instead.

## License

This plugin is licensed for free under the MIT License.

## Requirements

This plugin requires [Craft CMS](https://craftcms.com/) 5.4.0 or later.

## Installation

To install the plugin, search for “Spark” in the Craft Plugin Store, or install manually using composer.

```shell
composer require putyourlightson/craft-spark
```

## Usage

Creates a data store with initial data and a button that refreshes the markup using the provided template path.

```twig
<div data-store="{ version: 'Alpha' }">
    <div id="main">
        Initial version:
        <input type="text" data-model="version">
    </div>

    <button data-on-click="{{ spark.get('_spark/main.twig') }}">
        Refresh
    </button>
</div>
```

Contains new markup and updates the data store with new values.

```twig
{# _spark/main.twig #}

<div id="main">
    Next version:
    <input type="text" data-model="version">
</div>

{% do spark.signal({ version: 'Beta' }) %}
```

### Template Variable Methods

#### `spark.get()`

Renders one or more template paths via a `GET` request, and swaps elements in the DOM that have matching IDs in the rendered templates.

```twig
{{ spark.get(
    '_spark/primary.twig', 
    '_spark/secondary.twig'
) }}
```

One or more variables can be passed into each template by providing an array instead of a string, with the syntax `[templatePath, variables]`.

```twig
{{ spark.get(
    ['_spark/primary.twig', { foo: 'bar' }], 
    '_spark/secondary.twig'
) }}

```

#### `spark.post()`

Runs one or more actions and renders one or more template paths via a `POST` request, and swaps elements in the DOM that have matching IDs in the rendered templates. Action response data is piped into the templates that follow.

```twig
{{ spark.post(
    'controller/action', 
    '_spark/main.twig'
) }}
```

One or more params can be passed into each action by providing an array instead of a string, with the syntax `[actionRoute, params]`.

```twig
{{ spark.post(
    ['controller/action', { foo: 'bar' }], 
    '_spark/main.twig'
) }}
```

Here is an example of using action response data in the template.

```twig
{# _spark/main.twig #}

{% if errors is defined %}
    <div class="alert">
        {{ errors|join(', ') }}
    </div>
{% endif %}
```

#### `spark.put()`

Same as `spark.post()` but uses the PUT method.

#### `spark.patch()`

Same as `spark.post()` but uses the PATCH method.

#### `spark.delete()`

Same as `spark.post()` but uses the DELETE method.

---

Created by [PutYourLightsOn](https://putyourlightson.com/).
