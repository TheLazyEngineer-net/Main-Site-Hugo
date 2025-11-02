+++
date = '2025-09-18'
title = 'The Complexity of Making a Button'
authors = ['Jared Suess']
description = 'A simple button opens a up a world of Javascript complexity'
tags = ['Programming', 'Javascript', 'Rant']
[params]
  subtitle = 'Learning web programming is freaking hard'
  featuredImage = 'svg/logo/js.svg'
  [params.quote]
    text = 'Controlling complexity is the essence of computer programming.'
    author = 'Brian Kernighan'
+++

Trying to make what seemed like a simple button turned into a long meander into web programming complexity.

<!--more-->

I have never been paid to make a website.  Leaving college, I was hired to do back end work and my career never pushed me away from that text-based world.  While I have spent some time investigating various web technologies over the years, they never held more than a passing fancy compared with other topics.  However, that all changed when I wanted to make this website.

Being a programmer and knowing that I wanted some specialized functionality, I opted to create this site from scratch using existing tooling.  I could have allowed others to guide me through the intricacies of creating this website.  Instead, I get to figure everything out.  In doing this, I keep finding myself distracted, confused, and demotivated with JavaScript and the wide world of the web (sorry).  A simple button exposed just how hard web programming actually is.

### Getting Going

Starting up an initial site skeleton for this site was an easy task thanks to Hugo, Nix, and some years of general programming knowledge.  After this, I had to make something to get going.  I wanted to begin with a small, contained problem.  I knew that my lack of web knowledge would trip me up eventually.  This led me to to a light/dark theme toggle button.  It toggles the color-theme of the page from light to dark.  It was a trivial problem that was well documented, so it seemed like a decent place to start.

I found many theme toggle examples from profitable companies that pay people to write documentation.  Unfortunately, I also found that none of them did quite what I wanted...the usual problems.  This meant that I got to read a bunch of GitHub implementations and AI-slop trying to find the rest of the logic that I needed.  I eventually figured out how to do everything, but it was a bit of a journey.

### Implementation

Here's the inital implementation for theme toggling on this site (it may have changed by now):

```javascript {copy=true title="/js/theme.js" caption="That's quite a bit of code for some toggling logic."}
// light / dark site theme setup and toggling
const defaultTheme = '{{ site.Params.theme.default | default "system"}}';
const themes = new Set(["system", "light", "dark"]);
const mediaIsDark = window.matchMedia("(prefers-color-scheme: dark)");
const themeToggles = document.querySelectorAll(
  'input[theme-toggle][type="checkbox"]',
);

const isDark = (val) => {
  return val === true || val === "dark";
};

const getTheme = (val) => {
  return isDark(val) ? "dark" : "light";
};

const setPageTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", getTheme(theme));
  // checked checkbox <=> dark mode
  themeToggles.forEach((e) => (e.checked = isDark(theme)));
};

// initialization of theme on load
let theme = localStorage.theme ? localStorage.theme : defaultTheme;
if (!themes.has(theme)) {
  theme = "system";
}

setPageTheme(theme !== "system" ? theme : getTheme(mediaIsDark.matches));
localStorage.theme = theme;

// add change event handler to the buttons
themeToggles.forEach((el) => {
  el.addEventListener("change", (e) => {
    const isDark = e.target.checked;
    setPageTheme(isDark);
    localStorage.theme = getTheme(isDark);
  });
});

// listen for system theme changes
mediaIsDark.addEventListener("change", (e) => {
  if (!localStorage.theme) {
    localStorage.theme = "system";
  }
  if (localStorage.theme === "system") {
    setPageTheme(getTheme(e.matches));
  }
});
```

This code does two things: changes the value of the `data-theme` attribute in the `<html>` element to the selected theme and saves the user's selection to localStorage.  Despite this, there's a lot of code here.  Let's take a look at what this does and how I got here.

### The Wrapper Function

One of the first major detours I went down was caused by inspecting other people's websites.  Often, the JavaScript would be wrapped in an anonymous function that was immediatedly executed.  It looks like either `(function () { ... })();` or `(() => { ... })();`.  After some internet digging, I found out these have the rather uninspired name of 'Immediately Invoked Function Expressions', or IIFEs.

I liked IIFEs as soon as I saw them.  They solved the global variable problem that I had worried about when starting to use JavaScript.  When one declares a variable in the main (global) scope of a JavaScript file, it will become global to the entire web page.  These variables can be accessed and changed anywhere else in the application.  A simple name collision (two variables with the same name) in different JavaScript files could create an awful puzzle to solve.  IIFEs solved this problem by scoping the file's variables to that file so that these naming collisions cannot occur.

After learning all of this useful information, I quickly put an IIFE into my early button implementation.  Feeling smart, I went to the browser's debugger to check some other logic.  I quickly noticed that my IIFE was wrapped in another IIFE...a function wrapper for my function wrapper.  Something was already adding an IIFE.  Confused, I got to do some more digging.

After a good long while, I realized that my JavaScript files were being run through [esbuild](https://esbuild.github.io/) in the Hugo templates.  In reading Hugo docs, I came to realize that the default format of the output is...you guessed it, IIFE.  The Hugo templates were building my JavaScript files (really just minifying) and automagically adding the IIFE.  I spent hours to figure out that Hugo, esbuild, and best practices were already doing what I had wanted to do.

### "Trivial" Variables

Looking at the button's actual code, the first thing that I did was setup some "constants" for later use:

```javascript
const defaultTheme = '{{ site.Params.theme.default | default "system"}}';
const themes = new Set(["system", "light", "dark"]);
const mediaIsDark = window.matchMedia("(prefers-color-scheme: dark)");
const themeToggles = document.querySelectorAll(
  'input[theme-toggle][type="checkbox"]',
);
```

The `defaultTheme` constant allows for the default theme to be configured through the Hugo static site generator and isn't particularly important to this discussion.  It's just the default of "system".  The `themes` variable is a set of the valid theme strings for this script.  It's mildly pointless but allows for easy validation later.  The `mediaIsDark` variable is the result of a media query for whether a the operating system is configured to use a dark theme.  Finally, the `themeToggles` variable is a collection of the checkbox inputs on the page that have the attribute 'theme-toggle'.  They are the state for the toggle.  All of this was fairly straightforward until I got distracted learning more about `const` in Javascript.

#### JavaScript "Constants"

Constants in JavaScript are a bit wonky.  Some people even argue to not use `const` since it doesn't really do much.  Constants in Javascript are only enforced on the declared variable.  If I have an integer, say `const i = 1`, then `i` as `1` will be constant.  However, if I have an object, say `const j = { i: 1 }`, then I am free to reassign `i` to whatever I want.  The pointer `j` will be constant, I can't reassign it to another object, but everything pointed to by the pointer is fair game.

Well, I quickly realized that I didn't care too much about all of this, made a mental note about what `const` actually means, and kept using it where seemingly appropriate since I like that it shows intent even if it doesn't always enforce it as expected.  My code ultimately wasn't doing anything interesting so this wasn't worth worrying about.

#### Minification

I next looked over the generated code with the browser debugger, I noticed that my `const`'s were now `var`'s.  I guessed that `esbuild` was up to some more tricks.  AI told me that `esbuild` might change `const` to `var`, so I didn't investigate further into the reasoning.  I knew it had to be the culprit.  Hugo documentation didn't indicate that this was configurable, so I decided to try converting this script to an ES6 module from an IIFE.  This didn't seem to disuade `esbuild` from converting the `const`'s.  I left the script as an ES6 module since it was a useful exercise.

I can always skip minification if I ever care enough about this `const` conversion.  I don't know why I would, other than caring that the code on this site is different from the code that I wrote.  As far as I can tell, there should be no functional difference in this change.  This had been a lot of work to set up some variables and it was time to move on.

### Functional Programming

Having figured some things out about JavaScript variables, I moved on to some useful functions for doing things:

```javascript {caption="The only section that I am mildly proud of..."}
const isDark = function (val) {
  return val === true || val === "dark";
};

const getTheme = function (val) {
  return isDark(val) ? "dark" : "light";
};

const setPageTheme = function (theme) {
  document.documentElement.setAttribute("data-theme", getTheme(theme));
  // checked checkbox <=> dark mode
  themeToggles.forEach((e) => (e.checked = isDark(theme)));
};
```

Each of these functions is surprisingly complex.  There is much implied information.  Some of that is due to quirky JavaScript, but some is a result of me spending too much time with Elixir and Lisp.  Let's go through each function individually since each warrents some discussion.

This first function, `isDark()`, will return true if passed `true` or `"dark"`, and false otherwise.  In the typed language world (normal for me), this is not one function but two: one function for each type (string and boolean).  If something other than those types is passed, the code won't compile.  JavaScript's loosey-goosey relationship with types allows for extremely precise, safe, and clear code in this case.

#### A Quick Aside

We also get our first introduction to another Javascript complication within this function: the strict equality operator.  Much like `const`, the equality operator `==` in Javascript doesn't do what people expect.  In normal languages, the equality operator returns true or false for whether two things are equal (`5 == 5` is true, `"five" == 5` is false).  In Javascript, this is the "loose" equality operator and it allows for type coercion before testing whether the two values are equal.  In other words, if Javascript has a way to make two types the same for comparison, it will.  This means that `"5" == 5` is true in Javascript (or the string "5" is equal to the integer 5), unlike in basically every other language.

Because Javascript is quite aggresive with type coercion, unexpected results occur.  That is why the strict equality `===` operator exists within Javascript: to test for equality without type coercsion.  The types of the arguments must be the same for the strict equality operator to return true.

#### Back to Whether it's Dark

In the context of the `isDark` function, the strict equality operators type-check that the `val` parameter is either a boolean or a string in order for it to return true.  This enforces exactly the behavior that I desired, though the check happens at runtime.  It also means that if anything else is passed (like accidently passing `null` or `undefined`), the function will just return false and the program will proceed as normal.  For a theme-toggle, this would be preferable: the color theme may be wrong but the page loads without issue.

Now that we have all this nice behavior wrapped in the `isDark` function, we can reuse it within `getTheme` function to return a string version of this value that can be used within the site.  This allows us to further combine with the `setPageTheme` function to set the theme for the page.  It will set the "data-theme" attribute on the page to the color scheme along with all themetoggle checkboxes to the correct value.

### Actually Doing Something

Finally, we can get to the actual logic of this theme-toggle.  Not much actually has to be done now.  First we need to initialize the theme on load:

```javascript {caption="The logic to set the theme on page load"}
// initialization of theme on load
let theme = localStorage.theme ? localStorage.theme : defaultTheme;
if (!themes.has(theme)) {
  theme = "system";
}

setPageTheme(theme !== "system" ? theme : getTheme(mediaIsDark.matches));
localStorage.theme = theme;
```

The first new concept we bring in here is local storage.  This is a place for sites to "store" information "locally" on the user's computer.  It's often used for cookies, tokens, and site settings.  Here we are using it to store the user's preference for their color theme.  This seems to be the way that other people do this, so I copied them.

The initialization merely gets the stored theme (if available), checks to make sure it's valid, then sets the site's theme to that.  It will also check to see if the dark color scheme is a system preference if the theme is set to "system".

### Listening for Changes

Since the site is now initialized to the currently configured value, we can move on to adding listeners for changes to the theme:

```javascript {caption="The chunkiness of JavaScript method calls..."}
// add change event handler to the buttons
themeToggles.forEach((el) => {
  el.addEventListener("change", (e) => {
    const isDark = e.target.checked;
    setPageTheme(isDark);
    localStorage.theme = getTheme(isDark);
  });
});

// listen for system theme changes
mediaIsDark.addEventListener("change", (e) => {
  if (!localStorage.theme) {
    localStorage.theme = "system";
  }
  if (localStorage.theme === "system") {
    setPageTheme(getTheme(e.matches));
  }
});
```

The first method on the `themeToggles` variable adds a listener for every toggle configured on a page.  This listens for change events and calls the anonymous function defined inline.  The `setPageTheme` function will synchonize the theme toggles on the page and update the theme.  I view setting the checkbox as setting the user preference, so it also sets the localStorage to the current value for future page loads.

Figuring out how to set up these listeners took some time.  Most examples that I found are some variation of what I eventually settled on, but there's a lot to parse here.  The first thing that I to figure out was which event or events to listen to.  A checkbox is an input element, so that was a starting point, but then I noticed that the events could be quite different between input types.  I eventually settled on the "change" event since it seemed to get me everything that I wanted.

Next, I had to figure out how to get the current state of the checkbox from the element.  Here, it matters that this is a checkbox input and not just an input, unlike with the listening event type.  There is a `checked` property on checkbox input elements that gives the current value as a nice boolean.  It took me a surprising amount of time, even while writing this article, to find [proper documentation for it](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/checked), but that can mostly be attributed to my ignorance.

The last thing to do was to listen for changes to the user's preferred system theme.  This is handled by a listener on the media query that we set up before in the variables.  The only reason this listener would have to do something is if the theme is configured for "system".  Pretty easy way to end the script.

### Summation

After more work than I would like to admit, I have a working theme toggle button that should be fairly easy to tweak in the future.  I am not convinced that my code is "correct" in any way, but it seems to work reliably.  The problem was self contained, like I had hoped, but it was more difficult than I had anticipated.  Javascript confirmed for me that it can be extremely difficult to use in practice.  The interactions between HTML, CSS, and Javascript is an immense topic.  Basically, my head hurts and I don't feel a fullfilling sense of accomplishment like I usually do when coding in Elixir, Lisp, or even Go.  My distaste for JavaScript has not been lessened.

Why did I write this article then?  Partly to moan a bit, yes, but that's just a small part of it.  I accept that JavaScript is what it is and that we're stuck with it on the web.  I'm sure all of the fancy frameworks, libraries, and tools for people paid to do web programming alleviate many of these pain points.  I'm a masochist, though, since I learn best through doing.  The reasons for writing this article then are:

1) To help others know that web programming is hard, even when you are an experienced software engineer.  This could be helpful for someone struggling, especially newer engineers.
2) To illustrate how insideous complexity can be.

A theme toggle button is a pretty simple thing.  JavaScript, HTML, and CSS introduce small levels of complexity with every interaction.  It doesn't take many interactions before a simple button becomes a complex block of code with many implications and assumptions.  Layer enough of these on top of each other, and quickly no one knows what the hell is going on.

I was able to control the complexity of this theme toggle by isolating the JavaScript to its own file and only interacting with preexisting, labeled page elements.  It is usually not that simple.  We need interactions between components and those interactions have followup effects.  This means many more interactions and ever increasing complexity.

By trying to create something simple, I have even more questions.  This exercise illustrated just how much there is to know.  The web domain is amazingly complex, with historical cruft, compatibility issues, and JavaScript as its language to do useful things.  The complexity that comes with something so intricate and large is impossible to fully remove.  The importance of managing this complexity easily becomes clear.  My theme toggle button was simple yet surprisingly complex.  After doing this enough times in countless contexts, I've found that the problem of complexity managment is one of the hardest and most rewarding problems to solve.
