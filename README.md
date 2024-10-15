<p align="center"><img width="150" src="https://raw.githubusercontent.com/putyourlightson/craft-spark/refs/heads/develop/src/icon.svg?token=GHSAT0AAAAAABUEIQTWQHGWPSK4IG7LEOUWZYMBAMQ"></p>

# Spark Plugin for Craft CMS

### A real-time, template-driven hypermedia framework for Craft CMS.

Spark provides an integration between [Craft CMS](https://craftcms.com/) and [Datastar](https://data-star.dev), a JavaScript library that combines the core functionality of [Alpine JS](https://alpinejs.dev/) with that of [htmx](https://htmx.org/). It advocates a hypermedia-first approach, meaning that you won’t find history support, JavaScript execution in responses, nor any other “bells and whistles”. This is intentional. By embracing the simplicity of hypermedia, the encapsulation of web components (natively or using [Lit](https://lit.dev/)) and the optimised DOM operations of web browsers, you can build highly performant, hypermedia-driven web apps, without requiring a full-blown JavaScript framework.

Read [Datastar’s getting started guide](https://data-star.dev/guide/getting_started).

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

Spark uses [Datastar](https://data-star.dev) for interacting with the back-end (via its [back-end plugins](https://data-star.dev/reference/plugins_backend)), and provides a simple API for which to do so.

```twig
<button data-on-click="{{ spark.get('_spark/main.twig') }}">
    Submit
</button>
```

Templates rendered by Spark should contain one or more `fragment` tags, each containing a single top-level element with an ID, which determines which elements in the DOM will be swapped (using [Idiomorph](https://github.com/bigskysoftware/idiomorph)).

```twig
{# _spark/main.twig #}

{% fragment %}
    <div id="main">
        This content will be swapped into the DOM based on its ID.
    </div>
{% endfragment %}
```

Datastar’s “store” params are automatically passed into each template.

```twig
<div data-store="{ username: 'bob' }">
    <button data-on-click="{{ spark.get('_spark/main.twig') }}">
        Submit
    </button>
</div>
```

Variables can be passed into the template using a second argument. Passed in variables will overwrite any of Datastar’s “store” params with the same names. Variables are tamper-proof yet visible in the source code in plain text, so you should avoid passing in any sensitive data.

```twig
<button data-on-click="{{ spark.get('_spark/main.twig', { userId: 1 }) }}">
    Submit
</button>
```

> [!NOTE]  
> Only primitive data types can be used as values: **strings**, **numbers**, **booleans** and **arrays**. Objects, models and elements _cannot_ be used. If you want to pass an element (or set of elements) into the template then you should pass in an ID (or array of IDs) instead and then fetch the element from within the component.

Actions can be run within templates rendered by Spark. The `spark.runAction()` function accepts a controller action route and a set of params (optional), and returns the action’s response data.

```twig
{# _spark/main.twig #}

{% set data = spark.runAction('users/save-user', { userId: userId }) %}

{% fragment %}
    <div id="main">
        {% if data.errors is defined %}
            Errors: {{ data.errors|join() }}
        {% else %}
            User successfully saved!
        {% endif %}
    </div>
{% endfragment %}
```

Datastar’s store params can be modified within templates rendered by Spark. The `spark.setStore()` function accepts a set of params.

```twig
{# _spark/main.twig #}

{% do spark.setStore({ username: 'bobby' }) %}
```

Multiple fragments can be sent back in a single response. Each fragment should be wrapped in a `fragment` tag and will replace the corresponding element in the DOM.

```twig
{# _spark/main.twig #}

{% fragment %}
    <div id="main">
        User successfully saved!
    </div>
{% endfragment %}

{% fragment %}
    <div id="username">
        Username: {{ username }}
    </div>
{% endfragment %}
```

Most actions require a `POST` request. Spark will automatically add a CSRF token to all non-`GET` requests, so you don’t have to think about them.

```twig
<button data-on-click="{{ spark.post('_spark/main.twig', { userId: 1 }) }}">
    Submit
</button>
```

The following HTTP request methods are supported:

- `spark.get()`
- `spark.post()`
- `spark.put()`
- `spark.patch()`
- `spark.delete()`

---

Created by [PutYourLightsOn](https://putyourlightson.com/).
