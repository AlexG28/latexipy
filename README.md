# LatexiPy - Pseudocode made easy

## What is LatexiPy?
LatexiPy is a python code to latex pseudocode converter. Paste in a valid python function code in the left textbox, click convert, and receive a LaTex pseudo-code equivalent in the right textbox. 

## Why is LatexiPy needed?
There are currently no easy ways of converting code to pseudocode. The options are doing it manually or through an LLM. Both methods are not ideal. LatexiPy seeks to solve this problem. 

## How does it work? 
LatexiPy employs a lexer and a parser to generate an abstract syntax tree of the python function which is then converted to latex pseudocode. The frontend framework chosen is SvelteKit due to its ease of use and high performance.

## Supported syntax
LatexiPy supports a large chunk of the python syntax. Int, float and string literals, lists, for and while loops, control flow, function calls and arithmetic expressions are all supported.

## Unsupported syntax
Some features that are not yet implemented include:
- support for calling external functions without a variable assignment
- list indexing such as `list[start:stop:step]`
- operators such as `*=`, `/=` and others 

Additionally, some features are unsupported due to them having no equivalent in latex pseudocode 
- object.function calls such as `list.find()`
- list comprehension


## Testing 
The parser and the latex generator logic have been extensively tested in `src/__tests__`


## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.


## Testing 

To run the unit tests: 
```
npm test
```