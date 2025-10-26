+++
date = '2025-09-18'
title = 'The Complexity of Making a Button'
authors = ['Jared Suess']
description = 'A simple button opens a up a world of Javascript complexity'
tags = ['Programming', 'Javascript', 'Rant']
[params]
  featuredImage = 'svg/logo/js.svg'
  [params.quote]
    text = 'Controlling complexity is the essence of computer programming.'
    author = 'Brian Kernighan'
+++

Web programming has an amazing amount of nuance when viewed from different angles.  This means that even a simple toggle button generates surprising amounts of complexity.

<!--more-->

I have never been paid to make a website.  Leaving college, I was hired to do backend work and my career never pushed me away from that text-based world.  While I have spent some time investigating various web technologies over the years, none of it ever held more than a passing fancy compared with other interests.  However, that all changed when I wanted to make this website.

Being a programmer and knowing that I wanted some specialized functionality, I opted to create this site from scratch using existing tooling.  Like all decisions, this one has consequences.  Site design could have been handled by people who know what they are doing through website builder software.  Instead, I get to figure everything out.  In figuring things out, I keep finding myself distracted, confused, and at times demotivated.  I am finding that there is even more complexity in the web domain than I had thought.

### Start it Up

Starting up an initial site skeleton was an easy task thanks to Hugo, Nix, and some years of general programming knowledge.  After this, I had to get going with some elements for my site to make it mine.  I wanted to begin with a small, contained problem.  I knew that my lack of web-knowledge would trip me up quickly.  This led me to to a light/dark theme toggle button.  It toggles the color-theme of the page from light to dark.  It was a trivial problem that was well documented, so it seemed like a decent place to start.

I found many theme toggle examples from profitable companies that pay people to write documentation.  Unfortunately, I also found that none of them did quite what I wanted...the usual problems.  This meant that I got to read a bunch of GitHub implementations and AI-slop trying to find the rest of the logic that I needed.  I eventually figured out how to do eveything, but it was a bit of a journey.

### Implementation

Here's the inital implementation for theme toggling on this site:

```javascript {copy=true title="/js/theme.js" caption="That's quite a bit of code for some toggling logic."}
// light / dark site theme setup and toggling
(function () {
  const defaultTheme = '{{ site.Params.theme.default | default "system"}}';
  const themes = new Set(["system", "light", "dark"]);
  const mediaIsDark = window.matchMedia("(prefers-color-scheme: dark)");
  const themeToggles = document.querySelectorAll(
    'input[theme-toggle][type="checkbox"]',
  );

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

  // initialization of theme on load
  let theme = (t = localStorage.theme) ? t : defaultTheme;
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
})();
```

This code does two things: changes the value of the `data-theme` attribute in the `<html>` element to the selected theme and saves the user's selection to localStorage.  Desptite this, there's a lot of code here.  Let's look at what it all does.

### The Wrapper Function

The JavaScript begins with the useful code being wrapped in a 'self executing anonymous function': `(function () { ... })()`.  It puts the theme selector code into an anonymous function that will be called when this code is loaded (at the end of the body in this case).  Anonymous just means nameless, or that the function doesn't have a name.  If it doesn't have a name, then you can't refer to it beyond where you define it.

My years of programming experience gave me the spidey-sense that this was a nice feature.  By wrapping the theme toggle code within an anonymous function, we keep these variables/functions in the scope of this function.  This way, we can't accidently use them in an unintended way or update some state in an unintended place.  I've spent hours (weeks probably) debugging that sort of thing and don't want to repeat it anytime soon.

I spent a while looking into this function wrapper after discovering it.  I had never seen such a thing before.  It did what I thought it did, but then I had to figure out when this was usually used, are there downsides, etc.  The conclusion that I came to was to just use it for things like this toggle-button since no one should be accessing anything going on in there, but it took some research time to come to that conclusion.

The first [Stack Overflow article](https://stackoverflow.com/questions/2421911/what-is-the-purpose-of-wrapping-whole-javascript-files-in-anonymous-functions-li) that I found explained all of this better than I can, so at least that was readily available.  However, beyond the research time, this code is ugly and increases the indent level with the first thing that we do.  Much like the Python `__init__.py` file, this is mental baggage that I now have to keep around.  This is unintended complexity being introduced into the system.  A lot has to be understood before even writing a line of code.

### Trivial Variables

Finally, we can get to some actual code.  The first thing that I did was setup some "constants" for later use:

```javascript
const defaultTheme = '{{ site.Params.theme.default | default "system"}}';
const themes = new Set(["system", "light", "dark"]);
const mediaIsDark = window.matchMedia("(prefers-color-scheme: dark)");
const themeToggles = document.querySelectorAll(
  'input[theme-toggle][type="checkbox"]',
);
```

The `defaultTheme` constant allows for the default theme to be configured through the Hugo static site generator and isn't particularly important to this discussion.  It's just the default of "system".  The `themes` variable is a set of the valid theme strings for this script.  It's mildly pointless but allows for easy checking.  The `mediaIsDark` variable is a media query for whether a the operating system has a dark theme configured.  Finally, the `themeToggles` variable is a collection of the checkbox inputs on the page that have the attribute 'theme-toggle'.  All of this was fairly straightforward until I got distracted learning more about `const` in Javascript.

### JavaScript "Constants"

Constants in JavaScript are a bit wonky.  Some people argue to not even use `const` since it doesn't do what people expect it to, or really do much of anything.  Constants in Javascript are only enforced on the declared variable.  If I have an integer, say `const i = 1`, then `i` as `1` will be constant.  However, if I have an object, say `const j = { i: 1 }`, then I am free to reassign `i` to whatever I want.  The pointer `j` will be constant, I can't reassign it to another object, but everything contained by the pointer is fair game.

Well, I quickly realized that I didn't care too much about all of this, made a mental note about what `const` actually means, and kept using it where seemingly appropriate since I like that it shows intent even if it doesn't always enforce it as expected.  Once again, I was doing something seemingly simple, why did I have to take a ten minute detour into this discussion?  I knew more afterwards, but all it would have taken was a quick "hey, this is what 'const' means, use it accordingly".

### Functional Programming

Now that we have the variables set up, we need some functions to do some things:

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

Each of these functions is surprisingly complex.  There is much implied information from exactly how I wrote them.  Some of that is due to quirky JavaScript, but some is a result of me spending too much time with Elixir and Lisp.  Let's go through each function individually since each warrents some discussion.

This first function, `isDark()`, will return true if passed `true` or `"dark"`, and false otherwise.  In the typed language world (normal for me), this is not one function but two.  One would have to write one function for each type (string and boolean).  If something other than those types is passed, the code won't compile.  JavaScript's loosey-goosey relationship with types allows for extremely precise, safe, and clear code in this case.

### A Quick Aside

We also get our first introduction into another Javascript complication within this function: the triple equals or strict equality operator.  Much like `const`, the equality operator "==" in Javascript doesn't do what people expect.  In normal languages, the equality operator returns true or false for whether two things are equal (`5 == 5` is true, `"five" == 5` is false).  In Javascript, the "loose" equality operator allows for type coercion first before testing whether the two values are equal.  In other words, if Javascript has a way to make two types the same for comparison, it will.  This means that `"5" == 5` is true in Javascript (or the string "5" is equal to the integer 5), unlike in basically every other language.

Because Javascript is quite aggresive with type coercion, unexpected results occur.  That is why the triple-equals "===" operator exists within Javascript, to test for equality without type coercsion.  The types of the arguments must be the same for the triple-equals to return true.

### Back to the Topic

In the context of the `isDark` function, the triple-equals operators type-check that the `val` parameter is either a boolean or a string in order for it to return true.  This enforces exactly the behavior that I desired, though the check happens at runtime.  It also means that if anything else is passed (like accidently passing `null` or `undefined`), the function will just return false and the program will proceed as normal.  For a theme-toggle, this would be preferable: have the color scheme wrong but the page still load.

Now that we have all this nice behavior wrapped in the `isDark` function, we can reuse it within `getTheme` to return a string version of this value that can be used within the site.  This allows us to further combine with the `setSiteTheme` function to set the theme for the site.  It will set the "data-theme" attribute on the page to the color scheme along with all themetoggle checkboxes to the correct value.

### Actually Doing Stuff

Finally, we can get to the actual logic of this theme-toggle.  Not much actually has to be done now.  First we need to initialize the site:

```javascript {caption="The initial setup of the page"}
// initialization of theme on load
let theme = (t = localStorage.theme) ? t : defaultTheme;
if (!themes.has(theme)) {
  theme = "system";
}

setPageTheme(theme !== "system" ? theme : getTheme(mediaIsDark.matches));
localStorage.theme = theme;
```

The first new concept we bring in here is local storage.  This is a place for sites to "store" information "locally" on the user's computer.  It's often used for cookies, tokens, and site settings.  Here we are using it to store the user's preference for their color theme.  This seems to be the way people do this so I followed suit.

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

The first method on the `themeToggles` variable adds a listener for every toggle configured on a page.  This listens for change events and calls the anonymous function defined inline.  The `setSiteTheme` function will synchonize the theme toggles on the page and update the theme.  I view setting the checkbox as setting the user preference, so it also sets the localStorage to the current value for future page loads.

Figuring out how to set up these listeners took some time.  Most examples that I found are some variation of what I eventually settled on, but there's a lot to parse here.  The first thing to figure out was which event or events to listen to.  This is an input element, so that was a starting point, but then I wanted to make sure the events weren't different for a checkbox.  I eventually settled on the "change" event since it seemed to get me everything that I wanted.

Next, I had to figure out how to get the current state of the checkbox from the element.  Here, it matters that this is a checkbox input and not just an input, unlike with the listening event type.  There is a `checked` property on checkboxe elements that gives me the correct value without any conversion of a generic value.  It took me a surprising amount of time, even writing this article, to find [proper documentation for it](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/checked).  Connecting that this was an available property only came to me through research after seeing it in an example.

Finally, I found out that one might want to listen to system theme preference updates through a media query, again, through reading found, example code.  This was another new concept to learn about.  Apparently, you can query the media type of the screen to find out more information about it, if you care.  I don't yet, but apparently I do since one of these queries is to see if the user has configured a preferred color theme of "light" or "dark".  There's a ton more to these, but this query allows the Javascript to check if the user has configured a dark theme preference, and if this changes, adjusts the site theme accordingly if it is set to the default of "system" theme.  On my system, since I have KDE Plasma configured to use its default dark theme, this means my site will defaut to dark without me needing to click the theme toggle for my preference.

### Summation

After more work than I would like to admit, I have a working theme toggle button that should be fairly easy to tweak in the future.  I am not convinced that my code is "correct" in any way, but it seems to work reliably.  The problem was self contained, like I had hoped, but it was more difficult than I would have liked or expected.  Javascript confirmed for me that it can be extremely difficult to use in practice.  The interactions between HTML, CSS, and Javascript is an immense topic.  Basically, my head hurts, and I don't feel a fullfilling sense of accomplishment like I do when coding in languages like Elixir, Lisp, or even Go.

Why did I write this article then?  Partly to moan a bit, yes, but that's just a small part of it.  I accept that JavaScript is what it is and that we're stuck with it on the web.  I'm sure all of the fancy frameworks, libraries, and tools for "real" web programmers take care of a bunch of the silliness that I encountered.  I'm a masochist though.  I want to learn through doing so I am using vanilla JavaScript on this site for now.  This then means I had other reasons for writing about these button trials:

1) To help others know that web programming is hard, even when you are an experienced software engineer.
2) To illustrate how insideous complexity can be.

A theme toggle button is a simple thing.  JavaScript, HTML, and CSS introduce small levels of complexity with every interaction.  It doesn't take many interactions before a simple button becomes a complex block of code with many implications and assumptions.  Layer enough of these on top of eachother, and quickly no one knows what's going on.

I could control the complexity of this theme toggle by isolating the JavaScript to its own file and only interacting with this element.  It is usually not that simple.  We need interactions between components, states that get updated, inputs ingested.  This means much more interaction, thus complexity.

This simple theme toggle makes it clear to me why there have been so many JavaScript frameworks over the years: we need them to manage the complexity of the web domain.  Over time, there will be an evolution in the way this complexity is managed and different paradigms will come and go out of fashion.  Interestingly enough, this further complicates the web programming space by having more choices for a path forward and pollution in examples with solutions for other frameworks.  This is a hard problem.  I now see why people find it interesting.
