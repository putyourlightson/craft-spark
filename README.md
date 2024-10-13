<p align="center"><img width="150" src="https://raw.githubusercontent.com/putyourlightson/craft-spark/refs/heads/develop/src/icon.svg?token=GHSAT0AAAAAABUEIQTWQHGWPSK4IG7LEOUWZYMBAMQ"></p>

# Spark Plugin for Craft CMS

### A reactive hypermedia framework for Craft CMS.

Spark provides an integration between Craft CMS and [Datastar](https://data-star.dev), a JavaScript library that combines the core functionality of [Alpine JS](https://alpinejs.dev/) with that of [htmx](https://htmx.org/). It advocates a hypermedia-first approach, meaning that you won’t find history support, JavaScript execution in responses, nor any other “bells and whistles”. This is intentional. By embracing the simplicity of hypermedia, the encapsulation of web components (natively or using [Lit](https://lit.dev/)) and the optimised DOM operations of web browsers, you can build highly performant, hypermedia-driven web apps, without requiring a full-blown JavaScript framework.

Read the [getting started guide](https://data-star.dev/guide/getting_started) for Datastar.

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

Creates a data store with initial data and a button that makes a `GET` request to the server and swaps the rendered template into the DOM on click.

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

Contains an element that will be swapped into the DOM based on its ID.

```twig
{# _spark/main.twig #}

<div id="main">
    Next version:
    <input type="text" data-model="version" value="Beta">
</div>
```

### Template Variables

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
