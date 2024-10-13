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

Spark uses [Datastar](https://data-star.dev) as the mechanism for interacting with the back-end, and provides a simple API for which to do so.

```twig
<div id="primary"></div>

<button data-on-click="{{ spark.get('_spark/primary.twig') }}">
    Submit
</button>
```

```twig
{# _spark/primary.twig #}

<div id="primary">
    This content will be swapped into the DOM based on its ID.
</div>
```

Templates fetched using `spark.get()` should contain a single top-level element with an ID, which determines which element in the DOM will be swapped (using [Idiomorph](https://github.com/bigskysoftware/idiomorph)).

Multiple parts of the DOM can be swapped by passing multiple template paths into `spark.get()`.

```twig
<button data-on-click="{{ spark.get('_spark/primary.twig', '_spark/secondary.twig') }}">
    Submit
</button>
```

Datastar’s “store” is automatically passed into each template. Variables can also be passed into each by providing an array instead of a string, with the syntax `[templatePath, variables]`.

```twig
<button data-on-click="{{ spark.get('[_spark/primary.twig', variables], '_spark/secondary.twig') }}">
    Submit
</button>
```

Actions can be run by passing their routes in as arguments, followed by any templates to be rendered. Most actions require a `POST` request, which can be made as follows.

```twig
<button data-on-click="{{ spark.post('users/save-user', '_spark/primary.twig') }}">
    Submit
</button>
```

Spark will automatically add a CSRF token to all non-`GET` requests.

The following HTTP request methods are supported:
- `spark.get()`
- `spark.post()`
- `spark.put()`
- `spark.patch()`
- `spark.delete()`

Action response data is piped into any templates that follow. So the following example shows how you might set up a user edit form on a page that displays the user’s username in the header.

```twig
<div id="user-form">
    <input type="hidden" name="userId" value="{{ currentUser.id }}">
    <input type="text" name="username" value="{{ currentUser.username }}">
    <button data-on-click="{{ spark.post('users/save-user', '_spark/save-user.twig', '_spark/username.twig') }}">
        Submit
    </button>
</div>
<div id="alert"></div>
```

```twig
{# _spark/save-user.twig #}

<div id="alert">
    {% if errors is defined and errors is not empty %}
        {% for error in errors %}
            {{ error }}
        {% endfor %}
    {% else %}
        User successfully saved.
    {% endif %}
</div>
```
